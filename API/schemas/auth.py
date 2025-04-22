from pydantic import BaseModel, EmailStr
from typing import Optional, Union
from uuid import UUID
from pydantic import validator
from datetime import date
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
    user_uuid: Optional[UUID] = None

class TokenData(BaseModel):
    """
    Схема для данных токена, декодированных из JWT.
    """
    uuid: Optional[str] = None

class RegisterRequest(BaseModel):
    """Схема запроса на регистрацию пользователя"""
    name: str
    surname: str
    email: str
    password: str
    gender: str
    date_of_birthday: str
    
    @validator('date_of_birthday')
    def validate_date_format(cls, v):
        try:
            date.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError('Invalid date format. Use YYYY-MM-DD format')
    
    @validator('gender')
    def validate_gender(cls, v):
        if v not in ["0", "1"]:
            raise ValueError('Gender must be "0" (female) or "1" (male)')
        return v
    
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