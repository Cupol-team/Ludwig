from db import get_user_profile, update_user, get_user_organizations, get_all_user_projects

from uuid import UUID


def get_user_profile_service(user_id: UUID):
    return get_user_profile(user_id)

def get_user_organizations_service(user_id: UUID):
    return get_user_organizations(user_id)

def get_user_projects_service(user_id: UUID):
    """
    Получает все проекты пользователя из всех организаций
    
    :param user_id: UUID пользователя
    :return: Список проектов пользователя
    """
    return get_all_user_projects(user_id)

def update_user_service(user_id: UUID, name: str | None = None, surname: str | None = None, gender: str | None = None, date_of_birthday: str | None = None, email: str | None = None, password: str | None = None):
    return update_user(user_id, name, surname, gender, password, email, date_of_birthday)
