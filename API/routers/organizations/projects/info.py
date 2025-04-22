from fastapi import APIRouter, Depends

from schemas import UserBase
from services import get_current_user
from services.organizations.projects.info import get_project_info_service
from db import verify_is_organization_exists

from typing import Annotated
from uuid import UUID

router = APIRouter(
    prefix="/{project_uuid}/info",
    tags=["Projects Info"],
)

@router.get("/")
async def get_project_info_endpoint(
    organization_uuid: UUID = Depends(verify_is_organization_exists),
    project_uuid: UUID = None,
    current_user: Annotated[UserBase, Depends(get_current_user)] = None
):
    return get_project_info_service(organization_uuid, project_uuid)
