from fastapi import APIRouter

from sqlalchemy.orm import Session
from fastapi import Depends

from schemas import OrganizationUpdate, OrganizationInviteUpdate
from db import create_session
from uuid import UUID

from services import edit_organization, get_organization_invite, update_organization_invite

router = APIRouter(
    prefix="/{organization_uuid}/setting",
    tags=["Organization Setting"],
)




@router.put("/edit", status_code=204)
def edit_organization_endpoint(organization_uuid: UUID, data: OrganizationUpdate,
                               db: Session = Depends(create_session)):
    """
    Изменение организации

    :param data: данные для изменения
           db: сессия базы данных
    """
    return edit_organization(db, organization_uuid=organization_uuid, name=data.name, description=data.description)


@router.get("/invite")
def get_invite_endpoint(organization_uuid: UUID, db: Session = Depends(create_session)):
    """
    Получение ссылки приглашения для организации
    
    :param organization_uuid: UUID организации
           db: сессия базы данных
    :return: Ссылка приглашения
    """
    return get_organization_invite(db, organization_uuid=organization_uuid)


@router.put("/invite", status_code=200)
def update_invite_endpoint(organization_uuid: UUID, data: OrganizationInviteUpdate,
                         db: Session = Depends(create_session)):
    """
    Обновление ссылки приглашения для организации
    
    :param organization_uuid: UUID организации
           data: новая ссылка приглашения
           db: сессия базы данных
    :return: Обновленная ссылка приглашения
    """
    return update_organization_invite(db, organization_uuid=organization_uuid, invite=data.invite)
