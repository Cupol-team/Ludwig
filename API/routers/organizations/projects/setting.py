from fastapi import APIRouter, Depends

from schemas import UserBase
from services import get_current_user
from schemas.organizations.project import ProjectUpdate
from services.organizations.projects.setting import edit_project

from typing import Annotated
from uuid import UUID



router = APIRouter(
    prefix="/{project_uuid}/setting",
    tags=["Projects Setting"],
)

@router.put("/edit", status_code=204)
async def edit_project_endpoint(
    organization_uuid: UUID, 
    project_uuid: UUID, 
    data: ProjectUpdate,
    current_user: Annotated[UserBase, Depends(get_current_user)],
):
    """
    Редактирование проекта
    
    :param organization_uuid: UUID организации
    :param project_uuid: UUID проекта
    :param data: данные для обновления проекта
    :param current_user: текущий пользователь
    :param db: сессия базы данных
    :return: обновленный проект
    """
    return edit_project(
        organization_uuid=organization_uuid, 
        project_uuid=project_uuid, 
        name=data.name, 
        description=data.description
    )
#def get_project_setting_endpoint(project_uuid: UUID, current_user: Annotated[UserBase, Depends(get_current_user)]):

