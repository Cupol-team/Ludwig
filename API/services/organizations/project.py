from sqlalchemy.orm import Session
from db import Organization, OrganizationMember, OrganizationData
from db import new_organization, new_organization_member, new_role, new_project_role, new_project_member
from services.organizations.projects.roles.role import create_new_permission_service
from schemas.organizations import ProjectCreate, ProjectResponse
from typing import List
from db.organizations.base.project_data import ProjectData
from db import new_project, get_user_projects, get_user_projects_with_roles


from uuid import UUID


def create_project(user_uuid: UUID, organization_uuid: UUID, project_data: ProjectCreate) -> ProjectData:
    """
    Создает проект для организации
    """
    project = new_project(organization_uuid=organization_uuid, name=project_data.name,
                          description=project_data.description)

    # Создание роли "teamlead" для проекта
    created_project_uuid = project[2]   
    created_role_uuid = new_project_role(organization_uuid, created_project_uuid, "Руководитель проекта", "")[2]

    # Добавление прав роли "teamlead" 
    create_new_permission_service(organization_uuid=organization_uuid, project_uuid=created_project_uuid,
                                  role_uuid=created_role_uuid, 
                                  permissions=[
                                      "task.create",
                                      "task.edit",
                                      "task.delete",

                                      "project.edit",
                                      "project.delete",

                                      "project.member.add",
                                      "project.member.edit",
                                      "project.member.delete",

                                      "project.role.create",
                                      "project.role.edit",
                                      "project.role.delete",

                                      "task.status.create",
                                      "task.status.edit",
                                      "task.status.delete",

                                      "task.type.create",
                                      "task.type.edit",
                                      "task.type.delete",
                                      ])


    # Добавление пользователя в роль "teamlead"
    new_project_member(user_uuid=user_uuid, role=created_role_uuid, organization_uuid=organization_uuid,
                       project_uuid=created_project_uuid)

    return project





def service_get_user_projects(organization_uuid: UUID, user_uuid: UUID) -> List[ProjectResponse]:
    """
    Получение всех проектов организации
    """
    projects_with_roles = get_user_projects_with_roles(organization_uuid=organization_uuid, user_uuid=user_uuid)

    return [ProjectResponse(
        uuid=project.uuid, 
        name=project.name, 
        description=project.description,
        role=role_name
    ) for project, role_name in projects_with_roles]