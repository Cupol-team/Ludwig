from fastapi import APIRouter, Depends

from schemas import NewOrganizationMember, UserBase

from services.organizations import add_member_to_organization
from services.organizations.members import get_organization_members_service
from services import get_current_user

from typing import Annotated
from uuid import UUID

router = APIRouter(
    prefix="/{organization_uuid}/members",
    tags=["Organzation Member"],
)

@router.put("/add_member")
def add_organization_member_endpoint(organization_uuid: UUID,
                                     current_user: Annotated[UserBase, Depends(get_current_user)],
                                     member_data: NewOrganizationMember,
                                     ):
    """
    Добавление участника в организацию

    :param  member_data: данные для добавления
    """
    from fastapi import HTTPException
    method_exec = add_member_to_organization(
        organization_uuid=organization_uuid,
        user_uuid=member_data.member_uuid,
        role_uuid=member_data.role_uuid
    )
    print(method_exec)
    if method_exec: return {
        "items": {"response": 1}
    }
    else:
        raise HTTPException(status_code=400, detail="User already in organization")


@router.get("/get")
def get_organization_members_endpoint(organization_uuid: UUID,
                                      current_user: Annotated[UserBase, Depends(get_current_user)],
                                      ):
    """
    Получение списка участников организации
    """
    method_exec = get_organization_members_service(organization_uuid=organization_uuid)
    
    if method_exec:
        return {
            "response": {
                "items": method_exec
            }
        }

