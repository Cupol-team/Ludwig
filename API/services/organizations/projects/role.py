from typing import Union, List
from uuid import UUID

from db import new_project_role, get_project_roles

def create_new_project_role(organization_uuid: UUID, project_uuid: UUID, name: str, description: str) -> Union[
    UUID, None]:
    method_exec = new_project_role(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                   name=name,
                                   description=description)

    return method_exec[-1]


def service_get_project_roles(organization_uuid: UUID, project_uuid: UUID):
    method_exec = get_project_roles(organization_uuid=organization_uuid, project_uuid=project_uuid)
    return method_exec  
