from db import new_organization_member

from uuid import UUID
from typing import Union


def add_member_to_organization(user_uuid: UUID, organization_uuid: UUID, role_uuid: UUID) -> Union[bool, None]:
    method_exec = new_organization_member(user_uuid=user_uuid, organization_uuid=organization_uuid, role=role_uuid)

    if method_exec: return True