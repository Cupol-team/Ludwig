from db import new_organization_member, get_organization_members

from uuid import UUID
from typing import Union


def add_member_to_organization(user_uuid: UUID, organization_uuid: UUID, role_uuid: UUID) -> Union[bool, None]:
    method_exec = new_organization_member(user_uuid=user_uuid, organization_uuid=organization_uuid, role=role_uuid)

    if method_exec: return True

def get_organization_members_service(organization_uuid: UUID):
    method_exec = get_organization_members(organization_uuid=organization_uuid)

    return method_exec


