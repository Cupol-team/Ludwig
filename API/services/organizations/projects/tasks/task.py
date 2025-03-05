from typing import Union, List
from uuid import UUID
from datetime import date

from db import update_project_task, delete_project_task, is_executor_in_project, is_type_in_project, is_status_in_project, get_project_task

def edit_project_task(organization_uuid: UUID, project_uuid: UUID, task_uuid: UUID, name: str | None,
                      description: str | None, executors: List[UUID] | None, task_date: date | None,
                      task_type: UUID | None, priority: str | None, status: str | None, task_data: dict | None = None) -> Union[
    UUID, None]:
    
    if task_data is None:
        task_data = get_project_task(organization_uuid=organization_uuid, project_uuid=project_uuid, task_uuid=task_uuid)
        if task_data is None:
            return {"error": 1, "error_message": "Task not found"}

    if executors is not None and task_data["executors"] != executors:
        if not all(is_executor_in_project(organization_uuid, project_uuid, executor) for executor in executors):
            return None

    if task_type is not None and task_data["type"] != task_type:
        if not is_type_in_project(organization_uuid, project_uuid, task_type):
            return None

    if status is not None and task_data["status"] != status:
        if not is_status_in_project(organization_uuid, project_uuid, status):
            return None

    update_project_task(organization_uuid=organization_uuid, project_uuid=project_uuid, task_uuid=task_uuid,
                        executors=executors, date=task_date, name=name,
                        task_type=task_type, priority=priority,
                        status=status, description=description)

    return True


def delete_project_task_service(organization_uuid: UUID, project_uuid: UUID, task_uuid: UUID) -> Union[UUID, None]:
    delete_project_task(organization_uuid=organization_uuid, project_uuid=project_uuid, task_uuid=task_uuid)

    return True
