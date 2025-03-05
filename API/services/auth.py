from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, Annotated
from contextlib import contextmanager

from db import create_session
import jwt
from jwt.exceptions import InvalidTokenError
from db import UserLoginData
from db import User
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone

from schemas import TokenData, UserBase

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1
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

def get_user(email: str):
    with get_db() as db:
        return db.query(UserLoginData).filter(UserLoginData.email == email).first()

def authenticate_user(email: str, password: str):
    user = get_user(email)
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
        email: str = payload.get("sub")
        token_type: str = payload.get("token_type")
        
        if email is None or token_type != "refresh":
            return None
            
        return TokenData(email=email)
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
        email: str = payload.get("sub")

        if email is None:
            raise credentials_exception

        token_data = TokenData(email=email)
    except InvalidTokenError:
        raise credentials_exception

    user = get_user(token_data.email)
    if user is None:
        raise credentials_exception
    return user