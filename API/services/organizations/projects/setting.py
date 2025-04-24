from db import update_project_data, delete_project
import uuid

def edit_project(organization_uuid: uuid.UUID, project_uuid: uuid.UUID, name: str = None, description: str = None) -> int:
    return update_project_data(organization_uuid, project_uuid, name, description)

def delete_project_service(organization_uuid: uuid.UUID, project_uuid: uuid.UUID) -> int:
    return delete_project(organization_uuid, project_uuid)

