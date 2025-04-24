from fastapi import APIRouter, Depends, HTTPException

from services import get_current_user
from schemas import UserBase
from services.organizations.projects.members.member import edit_project_member_service, delete_project_member_service

from uuid import UUID
from typing import Annotated

router = APIRouter(
    prefix="/{member_uuid}",
    tags=["Projects Members Controller"],
)

@router.get("/get")
async def get_project_member_endpoint(member_uuid: UUID,
                                      current_user: Annotated[UserBase, Depends(get_current_user)]):
    return 1

@router.delete("/delete")
async def delete_project_member_endpoint(member_uuid: UUID,
                                         project_uuid: UUID,
                                         organization_uuid: UUID,
                                         current_user: Annotated[UserBase, Depends(get_current_user)]):
    method_exec = delete_project_member_service(member_uuid=member_uuid,
                                              project_uuid=project_uuid,
                                              organization_uuid=organization_uuid)
    if method_exec: return {
        "response": 1
    }
    else: raise HTTPException(status_code=400, detail="Error deleting project member")

@router.put("/edit")
async def edit_project_member_endpoint(member_uuid: UUID,
                                        organization_uuid: UUID,
                                        project_uuid: UUID,
                                        role_uuid: UUID,
                                        current_user: Annotated[UserBase, Depends(get_current_user)]):
    method_exec = edit_project_member_service(member_uuid=member_uuid,
                                              organization_uuid=organization_uuid,
                                              project_uuid=project_uuid,
                                              role_uuid=role_uuid)
    if method_exec: return {
        "response": 1
    }
    else: raise HTTPException(status_code=400, detail="Error editing project member")

