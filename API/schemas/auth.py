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
    """Схема запроса на регистрацию пользователя"""
    name: str
    surname: str
    email: str
    password: str
    gender: str
    date_of_birthday: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Иван",
                "surname": "Иванов",
                "email": "ivan@example.com",
                "password": "securepassword123",
                "gender": "1",
                "date_of_birthday": "1990-01-01"
            }
        } 

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