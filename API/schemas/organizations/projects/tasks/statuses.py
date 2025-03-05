from pydantic import BaseModel
from uuid import UUID


class ProjectStatusCreate(BaseModel):
    name: str
    description: str | None = ""


class ProjectStatusEdit(BaseModel):
    name: str
    description: str | None