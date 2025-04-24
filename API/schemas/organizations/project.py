from pydantic import BaseModel
from uuid import UUID


class ProjectCreate(BaseModel):
    name: str
    description: str | None = ""

class ProjectResponse(BaseModel):
    uuid: UUID
    name: str
    description: str | None = ""
    role: str | None = None

    class Config:
        orm_mode = True 

class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None 
