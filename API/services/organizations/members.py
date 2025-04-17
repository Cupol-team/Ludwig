from db import new_organization_member, get_organization_members, is_user_in_organization

from uuid import UUID
from typing import Union


def add_member_to_organization(user_uuid: UUID, organization_uuid: UUID, role_uuid: UUID) -> Union[bool, None]:
    # Сначала проверяем, есть ли пользователь уже в организации
    if is_user_in_organization(user_uuid=user_uuid, organization_uuid=organization_uuid):
        return False
    
    # Если пользователя нет, добавляем его
    method_exec = new_organization_member(user_uuid=user_uuid, organization_uuid=organization_uuid, role=role_uuid)
    print(method_exec, 'method_exec')
    if method_exec: 
        return True
    return None

def get_organization_members_service(organization_uuid: UUID):
    method_exec = get_organization_members(organization_uuid=organization_uuid)

    return method_exec


