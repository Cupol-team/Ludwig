from typing import Optional
from pydantic import BaseModel
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


class OrganizationCreate(BaseModel):
    name: str
    description: str | None = ""


class NewOrganizationMember(BaseModel):
    member_uuid: UUID
    role_uuid: UUID