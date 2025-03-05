import os
from typing import Union
from uuid import UUID
from utils.config import config
from db import get_files_by_project
from db.uploads_db.uploads_data import File
from db import get_file_data_by_id, delete_file_by_id, get_avatar_data_by_id, delete_avatar_by_id
from fastapi import HTTPException
from pathlib import Path
UPLOAD_FOLDER = config.UPLOAD_FOLDER


async def service_get_file(file_id: UUID, mode: str = "file"):
    if mode == "file":
        method_exec = get_file_data_by_id(file_id)
        file_path = f'{UPLOAD_FOLDER}/{method_exec["organization_uuid"]}/{method_exec["project_uuid"]}/{file_id}{method_exec["ext"]}'
        file_path = Path(file_path)

    elif mode == "avatar":
        method_exec = get_avatar_data_by_id(file_id)
        file_path = f'{UPLOAD_FOLDER}/avatars/{method_exec["photo_uuid"]}{method_exec["ext"]}'
        file_path = Path(file_path)

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Файл отсутствует на сервере")
    return {'file_path': file_path, 'file_name': f'{method_exec["name"]}{method_exec["ext"]}'}



async def service_get_files_by_project(project_uuid: UUID):
    try:
        files = get_files_by_project(project_uuid)
        return files
    except Exception as e:
        print(e)


async def service_delete_file(file_id: UUID, mode: str = "file"):
    try:
        if mode == "file":
            file_data = get_file_data_by_id(file_id)
            file_path = f'{UPLOAD_FOLDER}/{file_data["organization_uuid"]}/{file_data["project_uuid"]}/{file_id}{file_data["ext"]}'
            if os.path.exists(file_path):
                os.remove(file_path)
            method_exec = delete_file_by_id(file_id)
            return method_exec
        
        elif mode == "avatar":
            avatar_data = get_avatar_data_by_id(file_id)
            file_path = f'{UPLOAD_FOLDER}/avatars/{avatar_data["photo_uuid"]}{avatar_data["ext"]}'
            if os.path.exists(file_path):
                os.remove(file_path)
            method_exec = delete_avatar_by_id(file_id)
            return method_exec
        
    except Exception as e:
        return {'error': e}