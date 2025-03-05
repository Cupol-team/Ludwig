import sys
import importlib

from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from typing import Annotated
from db import update_project_task
from db.organizations.project_base import TaskData, TaskExecutor
from services import get_current_user

from services.organizations.projects.tasks import edit_project_task, delete_project_task_service
from db import get_project_task

from schemas import UserBase
from schemas.organizations.projects.tasks import ProjectTaskEdit

from sqlalchemy import text
import traceback

# TODO: РОУТЕР ДЛЯ УПРАВЛЕНИЯ ТАСКА, ЗНАЯ ЕГО UUID
router = APIRouter(
    prefix="/{task_uuid}",
    tags=["Projects Tasks Controller"],
)


@router.delete("/delete")
async def delete_project_task_endpoint(organization_uuid: UUID, project_uuid: UUID, task_uuid: UUID,
                                       current_user: Annotated[UserBase, Depends(get_current_user)]):
    method_exec = delete_project_task_service(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                              task_uuid=task_uuid)
    return 1


@router.post("/edit")
async def edit_project_task_endpoint(organization_uuid: UUID, project_uuid: UUID, task_uuid: UUID,
                                     current_user: Annotated[UserBase, Depends(get_current_user)],
                                     task_edit_data: ProjectTaskEdit):
    task_data = get_project_task(organization_uuid=organization_uuid, project_uuid=project_uuid, task_uuid=task_uuid)
    if task_data is None:
        raise HTTPException(status_code=404, detail={"error": 1, "error_message": "Task not found"})

    method_exec = edit_project_task(organization_uuid=organization_uuid, project_uuid=project_uuid, task_uuid=task_uuid,
                                    executors=task_edit_data.executors, task_date=task_edit_data.date,
                                    name=task_edit_data.name,
                                    task_type=task_edit_data.type, priority=task_edit_data.priority,
                                    status=task_edit_data.status, description=task_edit_data.description)
    
    if method_exec is None:
        raise HTTPException(status_code=400, detail={"error": 1, "error_message": "Failed to edit task"})
    
    return {
        "response": 1
    }


@router.get("/get")
async def get_project_task_endpoint(organization_uuid: UUID, project_uuid: UUID, task_uuid: UUID,
                                    current_user: Annotated[UserBase, Depends(get_current_user)]):
    task_data = get_project_task(organization_uuid=organization_uuid, project_uuid=project_uuid, task_uuid=task_uuid)
    if task_data is None:
        raise HTTPException(status_code=404, detail={"error": 1, "error_message": "Task not found"})

    return {
        "response": task_data
    }