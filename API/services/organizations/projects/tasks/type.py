from db import update_project_type_of_task, delete_project_type_of_task
from typing import Union
from uuid import UUID


def edit_project_task_type(organization_uuid: UUID, project_uuid: UUID, type_of_task_uuid: UUID, name: str,
                           description: str) -> Union[UUID, None]:
    method_exec = update_project_type_of_task(organization_uuid=organization_uuid,
                                              project_uuid=project_uuid, type_of_task_uuid=type_of_task_uuid,
                                              name=name, description=description)
    return True


def delete_project_task_type_service(organization_uuid: UUID, project_uuid: UUID, type_of_task_uuid: UUID) -> Union[
    UUID, None]:
    delete_project_type_of_task(organization_uuid=organization_uuid, project_uuid=project_uuid,
                                type_of_task_uuid=type_of_task_uuid)
    return True
