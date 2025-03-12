from db import delete_project_role, update_project_role, create_new_permission, delete_permission, get_permissions

from typing import List, Union
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


def create_new_permission_service(organization_uuid: UUID, project_uuid: UUID, role_uuid: UUID, permissions: List[str]) -> Union[bool, None]:
    method_exec = create_new_permission(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                      role_uuid=role_uuid, permissions=permissions)
    if method_exec:
        return True


def delete_permission_service(organization_uuid: UUID, project_uuid: UUID, role_uuid: UUID, permissions: List[str]) -> Union[bool, None]:
    method_exec = delete_permission(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                      role_uuid=role_uuid, permissions=permissions)
    if method_exec:
        return True
    

def get_permissions_service(organization_uuid: UUID, project_uuid: UUID, role_uuid: UUID) -> Union[bool, None]:
    method_exec = get_permissions(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                      role_uuid=role_uuid)
    if method_exec:
        return method_exec


