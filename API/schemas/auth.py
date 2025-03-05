from pydantic import BaseModel, EmailStr
from typing import Optional, Union
from uuid import UUID


class LoginRequest(BaseModel):
    """
    Схема для входящих данных при попытке авторизации.
    """
    email: EmailStr
    password: str

class Token(BaseModel):
    """
    Схема для ответа с токеном при успешной авторизации.
    """
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """
    Схема для данных токена, декодированных из JWT.
    """
    user_id: Optional[int] = None
    email: Optional[EmailStr] = None

class RegisterRequest(BaseModel):
    """
    Схема для регистрации нового пользователя.
    """
    username: Union[str, None] = None
    email: str
    password: str

class UserResponse(BaseModel):
    """
    Схема для ответа с информацией о пользователе (без пароля).
    """
    id: int
    username: str
    email: EmailStr
    is_active: bool = True

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    id: int
    uuid: UUID

    class Config:
        orm_mode = True