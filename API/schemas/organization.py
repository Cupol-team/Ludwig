from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from uuid import UUID


class OrganizationResponse(BaseModel):
    uuid: UUID
    name: str
    description: str | None = None  # description может быть None

    class Config:
        orm_mode = True  # Это важно, чтобы Pydantic могла работать с SQLAlchemy моделями


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    avatar_uuid: Optional[UUID] = None


class OrganizationCreate(BaseModel):
    """Схема запроса на создание организации"""
    name: str
    description: Optional[str] = ""
    avatar_uuid: UUID
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Моя организация",
                "description": "Описание моей организации",
                "avatar_uuid": "550e8400-e29b-41d4-a716-446655440000"
            }
        }


class NewOrganizationMember(BaseModel):
    member_uuid: UUID
    role_uuid: UUID