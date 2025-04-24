from pydantic import BaseModel
from typing import List

class ProjectRoleCreate(BaseModel):
    name: str
    description: str
    permissions: List[str] | None = None

class ProjectRoleEdit(BaseModel):
    name: str
    description: str
