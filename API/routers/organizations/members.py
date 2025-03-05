from fastapi import APIRouter, Depends

from schemas import NewOrganizationMember, UserBase

from services.organizations import add_member_to_organization
from services import get_current_user

from typing import Annotated
from uuid import UUID

router = APIRouter(
    prefix="/{organization_uuid}/members",
    tags=["Organzation Member"],
)

# FIXME: короче я хуй знает что тут работает, а что нет, нужно починить =(
@router.put("/add_member")
def add_organization_member_endpoint(organization_uuid: UUID,
                                     current_user: Annotated[UserBase, Depends(get_current_user)],
                                     member_data: NewOrganizationMember,
                                     ):
    """
    Добавление участника в организацию

    :param  member_data: данные для добавления
    """
    method_exec = add_member_to_organization(
        organization_uuid=organization_uuid,
        user_uuid=current_user.uuid,
        role_uuid=member_data.role_uuid
    )

    if method_exec: return {
        "items": {"response": 1}
    }
