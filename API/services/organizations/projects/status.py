from db import new_project_status, get_project_statuses
from typing import Union
from uuid import UUID


def create_new_project_status(organization_uuid: UUID, project_uuid: UUID, name: str, description: str) -> Union[
    UUID, None]:
    method_exec = new_project_status(organization_uuid=organization_uuid,
                                     project_uuid=project_uuid,
                                     name=name, description=description)
    return method_exec[-1]

def service_get_project_statuses(organization_uuid: UUID, project_uuid: UUID) -> list:
    return get_project_statuses(organization_uuid=organization_uuid, project_uuid=project_uuid)
