from fastapi import APIRouter, Depends

from schemas import UserBase
from schemas.organizations.projects.tasks import ProjectTaskTypeEdit

from services import get_current_user
from services.organizations.projects.tasks import edit_project_task_type, delete_project_task_type_service
from typing import Annotated
from uuid import UUID

router = APIRouter(
    prefix="/{task_type_uuid}",
    tags=["Projects Tasks Types Controller"],
)


# TODO: https://github.com/Cupol-team/API/issues/11
@router.delete("/delete")
async def delete_project_task_type_endpoint(organization_uuid: UUID, project_uuid: UUID, task_type_uuid: UUID,
                                            current_user: Annotated[UserBase, Depends(get_current_user)]):
    method_exec = delete_project_task_type_service(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                              type_of_task_uuid=task_type_uuid)
    return method_exec


# TODO: https://github.com/Cupol-team/API/issues/11
@router.post("/edit")
async def edit_project_task_type_endpoint(organization_uuid: UUID, project_uuid: UUID, task_type_uuid: UUID,
                                          current_user: Annotated[UserBase, Depends(get_current_user)],
                                          type_of_task_data: ProjectTaskTypeEdit):
    method_exec = edit_project_task_type(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                         type_of_task_uuid=task_type_uuid, name=type_of_task_data.name,
                                         description=type_of_task_data.description)
    return method_exec


@router.get("/get")
async def get_project_task_type_endpoint():
    return 1
