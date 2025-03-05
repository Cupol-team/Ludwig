from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class FileCreate(BaseModel):
    organization_uuid: UUID
    project_uuid: UUID
    expire_time: Optional[datetime] = None
    max_downloads: Optional[int] = None

