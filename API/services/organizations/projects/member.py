from db import new_project_member, get_project_members, is_user_in_organization, delete_project_member

from fastapi import HTTPException

from typing import Union, List

from uuid import UUID


def add_project_member(organization_uuid: UUID, project_uuid: UUID, user_uuid: UUID, role_uuid: UUID) -> Union[bool, None]:

    # Проверка, есть ли пользователь в организации
    if not is_user_in_organization(organization_uuid, user_uuid):
        raise HTTPException(status_code=403, detail="Access denied")

    method_exec = new_project_member(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                     user_uuid=user_uuid, role=role_uuid)

    if method_exec: return True

def delete_project_member_service(user_uuid: UUID, project_uuid: UUID):
    return delete_project_member(user_uuid=user_uuid, project_uuid=project_uuid)


def service_get_project_members(organization_uuid: UUID, project_uuid: UUID):
    data_project_members = get_project_members(organization_uuid, project_uuid)
    return data_project_members