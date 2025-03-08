from pydantic import BaseModel
from uuid import UUID


class ProjectCreate(BaseModel):
    name: str
    description: str | None = ""
    avatar_uuid: UUID

class ProjectResponse(BaseModel):
    uuid: UUID
    name: str
    description: str | None = ""

    class Config:
        orm_mode = True 
