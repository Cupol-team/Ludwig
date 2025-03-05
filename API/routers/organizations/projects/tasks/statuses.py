from fastapi import APIRouter, Depends

from schemas import UserBase
from schemas.organizations.projects.tasks import ProjectStatusCreate, ProjectStatusEdit

from services import get_current_user
from services.organizations.projects.tasks.statuses import edit_project_status, delete_project_status_service

from typing import Annotated
from uuid import UUID

router = APIRouter(
    prefix="/{status_uuid}",  # /{project_uuid}/tasks",
    tags=["Projects Statuses Controller"],
)


# TODO: https://github.com/Cupol-team/API/issues/11
@router.delete("/delete")
async def delete_project_status_endpoint(organization_uuid: UUID, project_uuid: UUID, status_uuid: UUID,
                                         current_user: Annotated[UserBase, Depends(get_current_user)]):
    method_exec = delete_project_status_service(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                                status_uuid=status_uuid)
    return method_exec


# TODO: https://github.com/Cupol-team/API/issues/11
@router.post("/edit")
async def edit_project_status_endpoint(organization_uuid: UUID, project_uuid: UUID, status_uuid: UUID,
                                       current_user: Annotated[UserBase, Depends(get_current_user)],
                                       status_edit_data: ProjectStatusEdit):
    method_exec = edit_project_status(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                      status_uuid=status_uuid, name=status_edit_data.name,
                                      description=status_edit_data.description)
    return method_exec


@router.get("/get")
async def get_project_status_endpoint():
    return 1
