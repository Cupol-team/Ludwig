import os
from uuid import UUID
from fastapi.responses import FileResponse
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form, Query
from typing import Annotated, Optional
from schemas import FileCreate, UserBase
from services import get_current_user
from services.uploads.upload import service_get_files_by_project
from datetime import datetime
from .uploads import upload_router

from services.upload import service_upload_file, service_upload_avatar

router = APIRouter(
    prefix="/files",
    tags=["Files"]
)

router.include_router(upload_router)


@router.get("")
async def get_files(current_user: Annotated[UserBase, Depends(get_current_user)], project_uuid: UUID = Query(...)):
    response = await service_get_files_by_project(project_uuid)
    return response if response else 'Files not found'


@router.post("/upload")
async def upload_file(
        current_user: Annotated[UserBase, Depends(get_current_user)],
        organization_uuid: UUID = Form(...),
        project_uuid: UUID = Form(...),
        expire_time: Optional[str] = Form(None),
        max_downloads: Optional[str] = Form(None),
        file: UploadFile = File(...),
):

    # Преобразуем max_downloads в int, если оно передано
    max_downloads_int = None
    if max_downloads:
        try:
            max_downloads_int = int(max_downloads)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid integer format for max_downloads")

    file_id = await service_upload_file(
        user_uuid=current_user.uuid,
        organization_uuid=organization_uuid,
        project_uuid=project_uuid,
        file=file,
        expire_time=expire_time,
        max_downloads=max_downloads_int,
    )

    if file_id.get("error"):
        raise HTTPException(status_code=500, detail=file_id.get("error_message"))

    return {
        "file_id": file_id.get("file_id"),
        "url": f"/files/{organization_uuid}/{project_uuid}/{file_id.get('file_id')}"
    }



@router.post("/avatar_upload")
async def avatar_upload(
        current_user: Annotated[UserBase, Depends(get_current_user)],
        subject_uuid: UUID = Form(...),
        file: UploadFile = File(...),
):

    file_id = await service_upload_avatar(
        subject_uuid=subject_uuid,
        file=file,
    )

    if file_id.get("error"):
        raise HTTPException(status_code=500, detail=file_id.get("error_message"))

    return {
        "file_id": file_id.get("file_id")
    }
