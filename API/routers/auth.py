from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from schemas import UserBase
from schemas.auth import RegisterRequest, Token
from services import authenticate_user, create_access_token, get_current_user
from services.auth import create_refresh_token, verify_refresh_token, get_user
from datetime import timedelta


ACCESS_TOKEN_EXPIRE_MINUTES = 30

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)

@router.post("/login")
def login_for_access_token(
    from_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    """
    Логин пользователя и выдача токена
    """
    user = authenticate_user(email=from_data.username, password=from_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(data={"sub": user.email})
    
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")

@router.post("/refresh")
def refresh_access_token(refresh_token: str) -> Token:
    """
    Обновление access token с помощью refresh token
    """
    token_data = verify_refresh_token(refresh_token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    
    user = get_user(token_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Создаем новые токены
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    new_refresh_token = create_refresh_token(data={"sub": user.email})
    
    return Token(access_token=access_token, refresh_token=new_refresh_token, token_type="bearer")

# FIXME: ВОЗВРАЩАТЬ USER КЛАСС, А НЕ USER_LOGIN_DATA КЛАСС, ПОТОМУ ЧТО ВАЛИДАЦИЯ ПАДАЕТ, ПИЗДА КОРОЧЕ
@router.get("/protected-data") # TODO: В создании пользователя,         нужно будет добавить валидацибю почты, иначе всё ляжет нахуй
def read_current_user(
    current_user: Annotated[UserBase, Depends(get_current_user)]
) -> UserBase:
    return UserBase(id=1, uuid=current_user.uuid)

@router.get("/profile")
def read_profile(current_user: Annotated[UserBase, Depends(get_current_user)]):
    return UserBase(id=1, uuid=current_user.uuid)