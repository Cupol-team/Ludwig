from fastapi import APIRouter

from schemas import UserBase
from services import get_current_user

from typing import Annotated
from uuid import UUID



router = APIRouter(
    prefix="/{project_uuid}/setting",
    tags=["Projects Setting"],
)

#def get_project_setting_endpoint(project_uuid: UUID, current_user: Annotated[UserBase, Depends(get_current_user)]):

