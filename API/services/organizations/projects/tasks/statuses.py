from db import new_project_status, update_project_status, delete_project_status
from typing import Union
from uuid import UUID

def edit_project_status(organization_uuid: UUID, project_uuid: UUID, status_uuid: UUID, name: str | None,
                        description: str | None) -> Union[UUID, None]:
    method_exec = update_project_status(organization_uuid=organization_uuid,
                                        project_uuid=project_uuid, status_uuid=status_uuid,
                                        name=name, description=description)
    return True


def delete_project_status_service(organization_uuid: UUID, project_uuid: UUID, status_uuid: UUID) -> Union[
    UUID, None]:
    delete_project_status(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                status_uuid=status_uuid)
    return True
