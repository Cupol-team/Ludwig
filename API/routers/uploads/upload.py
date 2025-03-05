import os
from uuid import UUID
from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends
from fastapi.responses import FileResponse
from services import get_current_user
from schemas import UserBase
from services.uploads.upload import service_get_file, service_delete_file
from typing import Annotated
from db import increment_download_count

router = APIRouter(
    prefix="/{file_id}",
    tags=["Files"]
)


@router.get("")
async def get_file(current_user: Annotated[UserBase, Depends(get_current_user)], file_uuid: UUID = Query(...), mode: str = Query(default="file")):
    response = await service_get_file(file_uuid, mode)
    file_path = response["file_path"]
    
    if mode == "file":
        increment_download_count(file_uuid)

    return FileResponse(
        path=file_path,
        filename=response["file_name"],
        media_type="application/octet-stream"
    )


@router.delete("")
async def delete_file(current_user: Annotated[UserBase, Depends(get_current_user)], file_uuid: UUID = Query(...), mode: str = Query(default="file")):
    method_exec = await service_delete_file(file_uuid, mode)
    return method_exec
