from fastapi import APIRouter, Depends

from schemas import UserBase
from schemas.organizations.projects.roles import EditProjectRole

from services import get_current_user
from services.organizations.projects.roles import delete_project_role_service, update_project_role, create_new_permission_service, delete_permission_service

from uuid import UUID
from typing import Annotated, List

router = APIRouter(
    prefix="/{role_uuid}",
    tags=["Projects Roles Controller"],
)

@router.get('/get')
async def get_project_role_endpoint():
    return 1

@router.delete('/delete')
async def delete_project_role_endpoint(organization_uuid: UUID, project_uuid: UUID, role_uuid: UUID,
                                       current_user: Annotated[UserBase, Depends(get_current_user)]):
    method_exec = delete_project_role_service(organization_uuid=organization_uuid,
                                              project_uuid=project_uuid,
                                              role_uuid=role_uuid)
    if method_exec: return {
        "response": 1
    }

@router.post('/edit/')
async def edit_project_role_endpoint(organization_uuid: UUID, project_uuid: UUID, role_uuid: UUID,
                                     current_user: Annotated[UserBase, Depends(get_current_user)],
                                     data: EditProjectRole):
    method_exec = update_project_role(organization_uuid=organization_uuid, project_uuid=project_uuid, role_uuid=role_uuid,
                                      name=data.name, description=data.description, permissions=data.permissions)

    if method_exec: return {
        "response": 1
    }


@router.post('/new_permission/')
async def new_permission_endpoint(organization_uuid: UUID, project_uuid: UUID, role_uuid: UUID, permissions: List[str],
                                  current_user: Annotated[UserBase, Depends(get_current_user)]):
    method_exec = create_new_permission_service(organization_uuid=organization_uuid, project_uuid=project_uuid, role_uuid=role_uuid,
                                      permissions=permissions)
    
    if method_exec: return {
        "response": 1
    }


@router.post('/delete_permission/')
async def delete_permission_endpoint(organization_uuid: UUID, project_uuid: UUID, role_uuid: UUID, permissions: List[str],
                                  current_user: Annotated[UserBase, Depends(get_current_user)]):
    method_exec = delete_permission_service(organization_uuid=organization_uuid, project_uuid=project_uuid, role_uuid=role_uuid,
                                      permissions=permissions)
    
    if method_exec: return {
        "response": 1
        }
