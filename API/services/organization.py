from sqlalchemy.orm import Session
from db import Organization, OrganizationMember, OrganizationData
from db import new_organization, new_organization_member, new_role
from schemas import OrganizationResponse
from fastapi import HTTPException, status
from typing import List

from uuid import UUID
from sqlalchemy import func


def get_user_organizations(db: Session, user_uuid: UUID) -> List[OrganizationResponse]:
    """
    Получает все организации, в которых состоит пользователь по его uuid.
    """
    organizations = db.query(OrganizationData).join(
        OrganizationMember,
        OrganizationData.uuid == OrganizationMember.organization_uuid  # Условие соединения
    ).filter(
        OrganizationMember.user_uuid == user_uuid
    ).all()

    return [OrganizationResponse(uuid=org.uuid, name=org.name, description=org.description) for org in organizations]


def get_all_organizations(db: Session) -> List[dict]:
    organizations_data = db.query(OrganizationData).all()
    data = [{'uuid': org.uuid, 'name': org.name, 'description': org.description} for org in organizations_data]
    if not organizations_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No organizations found for the user"
        )
    return data


def edit_organization(db: Session, name: str, organization_uuid: UUID, description: str | None = None, invite: str | None = None):
    # Проверяем существование записи
    organization_data = db.query(OrganizationData).filter(OrganizationData.uuid == organization_uuid).first()
    if not organization_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No organization found for the uuid"
        )

    try:
        # Обновляем только переданные данные
        if name is not None and name != "":
            organization_data.name = name

        if description is not None:
            organization_data.description = description
            
        if invite is not None:
            organization_data.invite = invite

        db.commit()
        db.refresh(organization_data)
        return organization_data

    except Exception as ex:
        db.rollback()  # Откат изменений
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error updating organization: {ex}"
        )


def create_organization(user_uuid: UUID, name: str, description: str | None = None):
    organization_created = new_organization(name, description)

    created_organization_uuid = organization_created[2]
    created_role_uuid = new_role(created_organization_uuid, "owner", "")[2]
    new_organization_member(user_uuid=user_uuid, role=created_role_uuid, organization_uuid=created_organization_uuid)

    # TODO: Сделать создание дефолтных ролей, которые присвоятся овнеру при создании организации @Kimiroshi
        #new_organization(organization_created_uuid)

    return {
        "status": "success",
        "message": "Organization has been successfully created!",
        "data": {
            "uuid": created_organization_uuid,
            "name": name,
            "description": description,
        }
    }


def add_member(organization_uuid: UUID, member: UUID, role: UUID):
    try:
        new_organization_member(member, organization_uuid, role)
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{ex}"
        )
    return {
        "status": "success",
        "message": "Organization member has been successfully added!",
        "data": {
            "organization": organization_uuid,
            "member": member,
            "role": role
        }
    }


def get_organization_invite(db: Session, organization_uuid: UUID):
    """Получение ссылки приглашения организации"""
    organization_data = db.query(OrganizationData).filter(OrganizationData.uuid == organization_uuid).first()
    if not organization_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No organization found for the uuid"
        )
    
    return {"invite": organization_data.invite}


def update_organization_invite(db: Session, organization_uuid: UUID, invite: str | None):
    """Обновление ссылки приглашения организации"""
    organization_data = db.query(OrganizationData).filter(OrganizationData.uuid == organization_uuid).first()
    if not organization_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No organization found for the uuid"
        )
    
    try:
        # Если в invite передан полный URL, извлекаем из него только код приглашения
        if invite and "invite/" in invite:
            # Разбиваем URL по "invite/" и берем последнюю часть
            invite = invite.split("invite/")[-1]
        
        organization_data.invite = invite
        db.commit()
        db.refresh(organization_data)
        return {"invite": organization_data.invite}
    except Exception as ex:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error updating organization invite: {ex}"
        )


def get_organization_by_invite(db: Session, invite_code: str):
    """Получение организации по коду приглашения"""
    organization_data = db.query(OrganizationData).filter(
        OrganizationData.invite.like(f"%{invite_code}%")
    ).first()
    
    if not organization_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No organization found for this invite code"
        )
    
    # Формируем ответ
    response = {
        "uuid": organization_data.uuid,
        "name": organization_data.name,
        "description": organization_data.description
    }
    
    return response
