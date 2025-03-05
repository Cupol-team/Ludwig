from pydantic import BaseModel

from typing import Optional, List

class EditProjectRole(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[str]] = None