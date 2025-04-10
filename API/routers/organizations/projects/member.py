from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from typing import Annotated, List

from services import get_current_user
from services.organizations.projects.member import add_project_member, service_get_project_members

from schemas import UserBase
from schemas.organizations.projects import AddProjectMember

from .members import projects_member_controller_router

router = APIRouter(
    prefix="/{project_uuid}/members",
    tags=["Projects Members"],
)


router.include_router(projects_member_controller_router)

@router.post("/add")
def add_organization_member_endpoint(organization_uuid: UUID, project_uuid: UUID,
                                     current_user: Annotated[UserBase, Depends(get_current_user)],
                                     member_data: AddProjectMember):
    """
    Добавление участника в проект.

    :param organization_uuid: UUID организации (передается как query-параметр)
    :param project_uuid: UUID проекта (из пути)
    """
    method_exec = add_project_member(
        organization_uuid=organization_uuid,
        project_uuid=project_uuid,
        user_uuid=member_data.user_uuid,
        role_uuid=member_data.role_uuid
    )

    if method_exec:
        return {"response": {"status": 1}}


@router.get("/")
def list_project_members(organization_uuid: UUID, project_uuid: UUID,
                         current_user: Annotated[UserBase, Depends(get_current_user)]):
    """
    Возвращает список всех участников проекта.

    :param organization_uuid: UUID организации (передается как query-параметр)
    :param project_uuid: UUID проекта (из пути)
    """
    try:
        members = service_get_project_members(organization_uuid, project_uuid)
        return {
            "response": {
                "items": members
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


