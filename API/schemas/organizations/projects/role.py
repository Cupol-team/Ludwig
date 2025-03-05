from pydantic import BaseModel

class ProjectRoleCreate(BaseModel):
    name: str
    description: str

class ProjectRoleEdit(BaseModel):
    name: str
    description: str
