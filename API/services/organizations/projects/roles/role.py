from db import delete_project_role, update_project_role

from typing import Union
from uuid import UUID


def delete_project_role_service(organization_uuid: UUID, project_uuid: UUID, role_uuid: UUID) -> Union[bool, None]:
    method_exec = delete_project_role(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                      role_uuid=role_uuid)
    if method_exec: return True


def edit_project_role_service(organization_uuid: UUID, project_uuid: UUID, role_uuid: UUID, name: str | None = None,
                              description: str | None = None, permissions: str | None = None):
    method_exec = update_project_role(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                      role_uuid=role_uuid,
                                      name=name, description=description, permissions=permissions)
    if method_exec: return True
