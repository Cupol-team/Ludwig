from fastapi import APIRouter, Depends

from schemas import UserBase
from schemas.organizations.projects.tasks import ProjectTaskTypeCreate

from services import get_current_user
from services.organizations.projects.type import create_project_task_type, get_project_types_of_tasks_service

from typing import Annotated
from uuid import UUID

from .tasks import projects_task_type_controller_router

# TODO: придумать как назвать потому что /type сомнительно
router = APIRouter(
    prefix="/{project_uuid}/type",
    tags=["Projects Tasks Types"],
)

router.include_router(projects_task_type_controller_router)


@router.put("/new")
async def create_project_task_type_endpoint(organization_uuid: UUID, project_uuid: UUID,
                                            current_user: Annotated[UserBase, Depends(get_current_user)],
                                            task_type_data: ProjectTaskTypeCreate):
    """
    Создание нового типа задачи в проекте

    :param organization_uuid:
    :param project_uuid:
    """
    # TODO: Check permissions and validate data

    created_task_type = create_project_task_type(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                                 name=task_type_data.name, description=task_type_data.description)
    return {
        "response": { 
            "uuid": created_task_type,
            "name": task_type_data.name,
            "description": task_type_data.description,
        }
    }

@router.get("/")
def get_organization_types_of_tasks_endpoint(organization_uuid: UUID,
                                            project_uuid: UUID,
                                            current_user: Annotated[UserBase, Depends(get_current_user)]):
    """
    Получение списка всех типов задач для организации
    """
    return {
        "response": {
            "items": get_project_types_of_tasks_service(organization_uuid=organization_uuid, project_uuid=project_uuid)
        }
    }

