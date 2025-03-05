from fastapi import APIRouter, Depends

from schemas import UserBase
from schemas.organizations.projects.tasks import ProjectStatusCreate, ProjectStatusEdit

from services import get_current_user
from services.organizations.projects.status import create_new_project_status, service_get_project_statuses

from typing import Annotated
from uuid import UUID

from .tasks import projects_statuses_controller_router

router = APIRouter(
    prefix="/{project_uuid}/statuses",  # /{project_uuid}/tasks",
    tags=["Projects Statuses"],
)

router.include_router(projects_statuses_controller_router)


@router.put("/new")
async def new_project_status_endpoint(current_user: Annotated[UserBase, Depends(get_current_user)],
                                      organization_uuid: UUID, project_uuid: UUID,
                                      data: ProjectStatusCreate):
    """
    Создание статуса проекта
    :param current_user:
    :param project_uuid:
    :param data:
    :param organization_uuid:
    :param db: сессия базы данных
    """
    method_exec = create_new_project_status(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                            name=data.name, description=data.description)
    return {
        "response": {
            "uuid": method_exec,
            "name": data.name,
            "description": data.description
        }
    }

@router.get("/")
async def get_project_statuses_endpoint(current_user: Annotated[UserBase, Depends(get_current_user)],
                                        organization_uuid: UUID, project_uuid: UUID):
    """
    Получение всех статусов проекта
    """
    return {
        "response": {
            "items": service_get_project_statuses(organization_uuid=organization_uuid, project_uuid=project_uuid)
        }
    }

