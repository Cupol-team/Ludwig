from fastapi import APIRouter

from sqlalchemy.orm import Session
from fastapi import Depends

from schemas import OrganizationUpdate
from db import create_session
from uuid import UUID

from services import edit_organization

router = APIRouter(
    prefix="/{organization_uuid}/setting",
    tags=["Organization Setting"],
)




@router.put("/edit", status_code=204)
def edit_organization_endpoint(organization_uuid: UUID, data: OrganizationUpdate,
                               db: Session = Depends(create_session)):
    """
    Изменение организации

    :param data: данные для изменения
           db: сессия базы данных
    """
    return edit_organization(db, organization_uuid=organization_uuid, name=data.name, description=data.description)
