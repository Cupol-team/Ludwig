from fastapi import APIRouter, Depends
from typing import Annotated

from schemas import UserBase
from schemas.user import UserBaseData
from services import get_current_user
from services.user import get_user_profile_service, get_user_organizations_service, get_user_projects_service, update_user_service


from uuid import UUID

router = APIRouter(
    prefix="/user",
    tags=["User"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def get_user_endpoint(current_user: Annotated[UserBase, Depends(get_current_user)]):
    return {
        "response": {
            "uuid": current_user.uuid
        }
    }

@router.get("/profile")
async def get_user_profile_endpoint(current_user: Annotated[UserBase, Depends(get_current_user)], user_id: UUID = None): 
    user_id = current_user.uuid if user_id is None else user_id #TODO: РЕАЛИЗОВАТЬ ПОЛУЧЕНИЕ НЕСКОЛЬКИХ ПРОФИЛЕЙ ДЛЯ ТОГО, ЧТОБ ПОДГРУЖАТЬ ЮЗЕРОВ В ПРОЕКТАХ И Т.Д.

    profile = get_user_profile_service(user_id)
    
    return {
        "response": {
            "profiles": profile
        }
    }

@router.get("/organizations")
async def get_user_organizations_endpoint(current_user: Annotated[UserBase, Depends(get_current_user)], user_id: UUID = None):
    user_id = current_user.uuid if user_id is None else user_id

    organizations = get_user_organizations_service(user_id)

    return {
        "response": organizations
    }

@router.get("/projects")
async def get_user_projects_endpoint(current_user: Annotated[UserBase, Depends(get_current_user)], user_id: UUID = None):
    """
    Получение всех проектов пользователя из всех организаций
    """
    user_id = current_user.uuid if user_id is None else user_id

    projects = get_user_projects_service(user_id)
    
    return {
        "response": {
            "items": projects
        }
    }

@router.put("/update")
async def update_user_endpoint(current_user: Annotated[UserBase, Depends(get_current_user)], user_data: UserBaseData):
    service_method = update_user_service(current_user.uuid, user_data.name, user_data.surname, user_data.gender, user_data.date_of_birthday, user_data.email, user_data.password)

    if service_method:
        return {    
            "response": "success"
        }
    
    return {
        "response": "error"
    }
