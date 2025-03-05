from typing import List

from pydantic import BaseModel
from uuid import UUID

from datetime import date


class ProjectTaskCreate(BaseModel):
    name: str
    description: str | None = ""
    type: UUID
    priority: int
    status: UUID
    date: date
    executors: List[UUID]

    class Config:
        orm_mode = True