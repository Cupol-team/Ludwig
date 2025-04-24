from fastapi import APIRouter, Depends

from typing import Annotated
from uuid import UUID

from services import get_current_user
from services.organizations.projects.role import create_new_project_role, service_get_project_roles
from services.organizations.projects.roles.role import create_new_permission_service

from schemas import UserBase
from schemas.organizations.projects import ProjectRoleCreate

from .roles import projects_role_controller_router

router = APIRouter(
    prefix="/{project_uuid}/role",
    tags=["Projects Roles"],
)

router.include_router(projects_role_controller_router)



@router.post("/new")
async def create_project_role_endpoint(organization_uuid: UUID, project_uuid: UUID,
                                       current_user: Annotated[UserBase, Depends(get_current_user)],
                                       data: ProjectRoleCreate):
    """
    Создание роли пользователя в проекте

    :param organization_uuid:
    :param project_uuid:
    """

    method_exec = create_new_project_role(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                          name=data.name, description=data.description)
    
    # Если переданы пермишшены, добавляем их к роли
    if data.permissions:
        create_new_permission_service(organization_uuid=organization_uuid, 
                                      project_uuid=project_uuid,
                                      role_uuid=method_exec, 
                                      permissions=data.permissions)

    return {
        "response": {
            "uuid": method_exec,
            "name": data.name,
            "description": data.description,
            "permissions": data.permissions
        }
    }


@router.get("/")
async def get_project_roles_endpoint(organization_uuid: UUID, project_uuid: UUID,
                                     current_user: Annotated[UserBase, Depends(get_current_user)]):
    method_exec = service_get_project_roles(organization_uuid=organization_uuid, project_uuid=project_uuid)
    return {"response": {"items": method_exec}}
