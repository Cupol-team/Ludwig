from db import get_project_types_of_tasks, new_project_type_of_task
from uuid import UUID
from typing import Union

def get_project_types_of_tasks_service(organization_uuid: UUID, project_uuid: UUID) -> list:
    return get_project_types_of_tasks(organization_uuid=organization_uuid, project_uuid=project_uuid)


def create_project_task_type(organization_uuid: UUID, project_uuid: UUID, name: str, description: str | None) -> Union[
    UUID, None]:
    """
    Создает тип тасков в проекте
    """
    method_exec = new_project_type_of_task(organization_uuid=organization_uuid, project_uuid=project_uuid, name=name,
                                           description=description)
    return method_exec[-1]