from fastapi import APIRouter, Depends, HTTPException

from schemas import UserBase
from schemas.organizations.projects import ProjectTaskCreate

from services import get_current_user
from services.organizations.projects.task import get_project_tasks_service, create_project_task

from typing import Annotated
from uuid import UUID

from .tasks import project_task_controller_router
router = APIRouter(
    prefix="/{project_uuid}/tasks",
    tags=["Projects Tasks"],
)

# router.include_router(projects_statuses_router)
# router.include_router(projects_type_router)
router.include_router(project_task_controller_router)


@router.put("/new")
async def create_project_task_endpoint(current_user: Annotated[UserBase, Depends(get_current_user)],
                                       organization_uuid: UUID,
                                       project_uuid: UUID, task_data: ProjectTaskCreate):
    created_task = create_project_task(creator=current_user.uuid, organization_uuid=organization_uuid,
                                       project_uuid=project_uuid, executors=task_data.executors, date=task_data.date,
                                       name=task_data.name, type=task_data.type,
                                       priority=task_data.priority, status=task_data.status,
                                       description=task_data.description)
    if created_task is None:
        raise HTTPException(status_code=400, detail={"error": "Произошла ошибка при создании таска"})
    
    return {
        "response": {
            "status": "success",
            "message": "Task was successfully created",
            "data": {
                      "uuid": created_task,
                      "name": task_data.name,
                      "description": task_data.description,
                      "creator": current_user.uuid,
                      "executors": task_data.executors,
                      "date": task_data.date,
                      "type": task_data.type,
                      "priority": task_data.priority,
                      "status": task_data.status
                  }
        }
    }

@router.get("/")
async def get_project_tasks_endpoint(current_user: Annotated[UserBase, Depends(get_current_user)],
                                     organization_uuid: UUID,
                                     project_uuid: UUID):
    tasks = get_project_tasks_service(organization_uuid=organization_uuid, project_uuid=project_uuid)
    return {
        "response": {
            "items": tasks
        }
    }

