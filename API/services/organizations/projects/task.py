from db import (new_project_task, get_project_tasks, is_executor_in_project, is_type_in_project, 
                is_status_in_project, is_user_in_organization)
from typing import Union, List
from uuid import UUID
from datetime import date


def create_project_task(creator: UUID, organization_uuid: UUID, project_uuid: UUID, name: str, type: UUID,
                        priority: int, status: UUID, date: date,
                        executors: List[UUID], description: str | None) -> Union[UUID, None]:
    """
    Создает таск в проекте
    """
    if len(executors) != len(set(executors)):
        return None
    
    if priority not in range(-2, 2+1):
        return None

    validations = [
        all(is_executor_in_project(organization_uuid, project_uuid, executor) for executor in executors),
        is_type_in_project(organization_uuid, project_uuid, type),
        is_status_in_project(organization_uuid, project_uuid, status), 
        is_user_in_organization(organization_uuid, creator)
    ]

    if not all(validations):
        return None


    method_exec = new_project_task(organization_uuid=organization_uuid,
                                   project_uuid=project_uuid,
                                   creator=creator, executors=executors, date=date, name=name, type=type,
                                   priority=priority, status=status, description=description)
    return method_exec[-1]

def get_project_tasks_service(organization_uuid: UUID, project_uuid: UUID) -> list:
    """
    Получает все таски из проекта
    """
    method_exec = get_project_tasks(organization_uuid=organization_uuid, project_uuid=project_uuid)
    return method_exec