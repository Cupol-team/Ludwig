from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from uuid import UUID


class OrganizationResponse(BaseModel):
    uuid: UUID
    name: str
    description: str | None = None  # description может быть None
    invite: str | None = None  # Добавляем поле для приглашения

    class Config:
        orm_mode = True  # Это важно, чтобы Pydantic могла работать с SQLAlchemy моделями


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class OrganizationInviteUpdate(BaseModel):
    """Схема для обновления ссылки приглашения"""
    invite: Optional[str] = None


class OrganizationCreate(BaseModel):
    """Схема запроса на создание организации"""
    name: str
    description: Optional[str] = ""
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Моя организация",
                "description": "Описание моей организации",
            }
        }


class NewOrganizationMember(BaseModel):
    member_uuid: UUID
    role_uuid: UUID | None = None