from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, Annotated
from contextlib import contextmanager
import uuid

from db import create_session, new_user

import jwt
from jwt.exceptions import InvalidTokenError
from db import UserLoginData
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from schemas.auth import RegisterRequest

from schemas import TokenData, UserBase

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7  # Срок действия refresh token - 7 дней


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# FIXME: КОСТЫЛЬ, ПОТОМ ПЕРЕДЕЛАТЬ
# 
# P.S. Если вы это читаете, значит я так и не переделал этот костыль.
# Удачи с дебагом! ¯\_(ツ)_/¯
@contextmanager
def get_db():
    db = create_session()
    try:
        yield db
    finally:
        db.close()

def get_user(uuid_str: str):
    try:
        uuid_obj = uuid.UUID(uuid_str)
        with get_db() as db:
            return db.query(UserLoginData).filter(UserLoginData.uuid == uuid_obj).first()
    except ValueError:
        # Если строка не может быть преобразована в UUID
        return None

def authenticate_user(email: str, password: str):
    with get_db() as db:
        user = db.query(UserLoginData).filter(UserLoginData.email == email).first()
        if not user or not user.check_password(password):
            return None
        return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    """Создает refresh token с более длительным сроком действия"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "token_type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_refresh_token(token: str):
    """Проверяет refresh token и возвращает данные пользователя"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uuid_str: str = payload.get("sub")
        token_type: str = payload.get("token_type")
        
        if uuid_str is None or token_type != "refresh":
            return None
            
        return TokenData(uuid=uuid_str)
    except InvalidTokenError:
        return None

def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)]
):
    """Validate the token and retrieve the current user without injecting DB session."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uuid_str: str = payload.get("sub")

        if uuid_str is None:
            raise credentials_exception

        token_data = TokenData(uuid=uuid_str)
    except InvalidTokenError:
        raise credentials_exception

    try:
        user = get_user(token_data.uuid)
        if user is None:
            raise credentials_exception
        return user
    except ValueError:
        # Если произошла ошибка при преобразовании UUID
        raise credentials_exception

def register_new_user(register_data: RegisterRequest) -> tuple:
    """
    Регистрирует нового пользователя и возвращает данные для создания токенов
    
    Args:
        register_data: Данные для регистрации пользователя
            - name: Имя пользователя
            - surname: Фамилия пользователя
            - email: Email пользователя
            - password: Пароль пользователя
            - gender: Пол пользователя ("0" - женщина, "1" - мужчина)
            - date_of_birthday: Дата рождения в формате YYYY-MM-DD
        
    Returns:
        tuple: (access_token, refresh_token)
        
    Raises:
        HTTPException: Если пользователь с таким email уже существует или произошла ошибка при создании
    """
    # Проверяем наличие всех обязательных полей
    required_fields = ["name", "surname", "email", "password", "gender", "date_of_birthday"]
    for field in required_fields:
        if not getattr(register_data, field, None):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Field '{field}' is required"
            )
    
    # Создаем нового пользователя
    try:
        user, user_data, user_login_data, user_uuid = new_user(
            name=register_data.name,
            surname=register_data.surname,
            email=register_data.email,
            password=register_data.password,
            gender=register_data.gender,
            date_of_birthday=register_data.date_of_birthday
        )
    except ValueError as e:
        # Обрабатываем ошибку, если пользователь уже существует
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        # Обрабатываем другие ошибки
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}",
        )
    
    # Создаем токены доступа и обновления
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user_uuid)}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": str(user_uuid)})
    
    return access_token, refresh_token, user_uuid