from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Annotated
from services import get_user_organizations, get_all_organizations, edit_organization, create_organization, \
    add_member, get_organization_by_invite
from .organizations import organization_roles_router, project_router, organization_members_router, organization_setting_router

from services import get_current_user
from schemas import OrganizationResponse, OrganizationUpdate, OrganizationCreate, UserBase
from db import Organization
from db import create_session
from uuid import UUID

router = APIRouter(
    prefix="/organizations",
    tags=["organizations"],
)

router.include_router(organization_roles_router)
router.include_router(project_router)
router.include_router(organization_members_router)
router.include_router(organization_setting_router)

# TODO: Понять, нахуй нужен получение всех организаций, когда у нас пользовательское API, но метод нам возможно понадобится
'''
@router.get("/get", response_model=List[dict])
def get_all_organizations_endpoint(db: Session = Depends(create_session), payload: dict = Depends(verify_token)):
    """
    Получение всех организаций

    :param db: сессия базы данных
    :return: список организаций
    """

    return get_all_organizations(db)'''


@router.get("/")
def get_organizations(current_user: Annotated[UserBase, Depends(get_current_user)], db: Session = Depends(create_session)):
    """
    Получение всех организаций, в которых состоит пользователь.

    :param current_user: authenticated user
    :param db: сессия базы данных
    :return: список организаций
    """
    user_uuid = current_user.uuid


    organizations = get_user_organizations(db, user_uuid)

    return {
        "items": organizations
    }


@router.put("/create")
def create_organization_endpoint(current_user: Annotated[UserBase, Depends(get_current_user)], data: OrganizationCreate):
    """
    Создание организации

    :param db: сессия базы данных
    """
    return create_organization(user_uuid=current_user.uuid, name=data.name, description=data.description)

@router.get("/invite/{invite_code}")
def get_organization_by_invite_endpoint(invite_code: str, db: Session = Depends(create_session)):
    """
    Получение информации об организации по коду приглашения
    
    :param invite_code: Код приглашения
           db: сессия базы данных
    :return: Информация об организации
    """
    return get_organization_by_invite(db, invite_code=invite_code)