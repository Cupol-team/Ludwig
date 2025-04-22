from db.db_functions import get_project_info

def get_project_info_service(organization_uuid, project_uuid):
    return get_project_info(organization_uuid, project_uuid)

