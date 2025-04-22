from fastapi import APIRouter, Depends, HTTPException, status
from .projects import projects_role_router, projects_members_router, projects_task_router, projects_statuses_router, \
    projects_task_types_router, projects_info_router
from uuid import UUID
from db import verify_is_organization_exists
from schemas import UserBase
from schemas.organizations import ProjectCreate
from services import get_current_user
from services.organizations import create_project, service_get_user_projects
from typing import List, Annotated


router = APIRouter(
    prefix="/{organization_uuid}/project",
    tags=["Project Methods"],
)

router.include_router(projects_role_router)
router.include_router(projects_task_router)
router.include_router(projects_members_router)
router.include_router(projects_statuses_router)
router.include_router(projects_task_types_router)
router.include_router(projects_info_router)

# NOTE: Уходят в projects/task.py - router
# router.include_router(projects_tasks_router)
# router.include_router(projects_statuses_router)

@router.get("/")
async def get_projects_endpoint(current_user: Annotated[UserBase, Depends(get_current_user)], organization_uuid: UUID = Depends(verify_is_organization_exists)):
    """
    Получение всех проектов организации
    """
    projects = service_get_user_projects(organization_uuid=organization_uuid, user_uuid=current_user.uuid)
    
    # NOTE: подумать, нужно ли возвращать ошибку, если нет проектов
    '''
    if not projects:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No projects found for the user"
        )
    '''
    return {
        "items": projects
    }





@router.put("/new")
async def create_project_endpoint(current_user: Annotated[UserBase, Depends(get_current_user)],
                                   project_data: ProjectCreate,
                                   organization_uuid: UUID = Depends(verify_is_organization_exists)):


    created_project = create_project(user_uuid=current_user.uuid, organization_uuid=organization_uuid,
                                     project_data=project_data)
    return {
        "response": {
            "status": "success",
            "message": "Project was successfully created",
            "items": {
                "uuid": created_project[2],
                "name": project_data.name,
                "description": project_data.description,
            }
        }
    }
