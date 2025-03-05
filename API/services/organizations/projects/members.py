from db import new_project_member, get_project_members

from db.base import User
from typing import Union, List

from uuid import UUID


def add_project_member(organization_uuid: UUID, project_uuid: UUID, user_uuid: UUID, role_uuid: UUID) -> Union[bool, None]:

    method_exec = new_project_member(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                     user_uuid=user_uuid, role=role_uuid)

    if method_exec: return True

def service_get_project_members(organization_uuid: UUID, project_uuid: UUID):
    data_project_members = get_project_members(organization_uuid, project_uuid)
    return data_project_members