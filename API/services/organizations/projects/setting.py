from db import update_project_data
import uuid

def edit_project(organization_uuid: uuid.UUID, project_uuid: uuid.UUID, name: str = None, description: str = None) -> int:
    return update_project_data(organization_uuid, project_uuid, name, description)
