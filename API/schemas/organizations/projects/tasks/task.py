from __future__ import annotations
from typing import List, Optional
from uuid import UUID
from datetime import date

from pydantic import BaseModel


class ProjectTaskEdit(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[UUID] = None
    priority: Optional[int] = None
    status: Optional[UUID] = None
    date: Optional[date] = None
    executors: Optional[List[UUID]] = None

    class Config:
        orm_mode = True