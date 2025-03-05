from pydantic import BaseModel


class ProjectTaskTypeCreate(BaseModel):
    name: str
    description: str | None = ""


class ProjectTaskTypeEdit(BaseModel):
    name: str
    description: str | None
