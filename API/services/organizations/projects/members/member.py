from uuid import UUID

from db import update_project_member, delete_project_member
def edit_project_member_service(member_uuid: UUID,
                                organization_uuid: UUID,
                                project_uuid: UUID,
                                role_uuid: UUID):
    
    return update_project_member(member_uuid=member_uuid,
                                organization_uuid=organization_uuid,
                                project_uuid=project_uuid,
                                role_uuid=role_uuid)

def delete_project_member_service(member_uuid: UUID,
                                  organization_uuid: UUID,
                                  project_uuid: UUID):
    return delete_project_member(user_uuid=member_uuid, project_uuid=project_uuid, organization_uuid=organization_uuid)

