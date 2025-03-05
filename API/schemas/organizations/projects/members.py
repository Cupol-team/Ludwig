from pydantic import BaseModel

from uuid import UUID

class AddProjectMember(BaseModel):
    user_uuid: UUID
    role_uuid: UUID