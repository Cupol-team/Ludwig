import os
from uuid import uuid4, UUID
from db import uploads_global_init, uploads_create_session, create_file, create_avatar, get_avatar_data_by_id
from fastapi import UploadFile, File, HTTPException
from datetime import datetime
from typing import Optional
from utils.config import config

UPLOAD_FOLDER = config.UPLOAD_FOLDER


def create_upload_folder():
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)


async def service_upload_file(user_uuid: UUID, organization_uuid: UUID, project_uuid: UUID,
                              expire_time: Optional[str] = None, max_downloads: Optional[int] = None,
                              file: UploadFile = File(...)):

    async def get_file_size(file: UploadFile) -> int:
        file.file.seek(0, 2)
        size = file.file.tell()
        file.file.seek(0)
        return size

    file_id = uuid4()
    filte_str_id = str(file_id)
    size = await get_file_size(file)
    name, ext = os.path.splitext(file.filename)
    stored_filename = f"{filte_str_id}{ext}"
    directory_path = os.path.join(UPLOAD_FOLDER, str(organization_uuid), str(project_uuid))

    if not os.path.exists(directory_path):
        os.makedirs(directory_path)

    file_path = os.path.join(directory_path, stored_filename)

    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        create_file(file_uuid=file_id, name=name, size=size, extension=ext, who_upload=user_uuid,
                    time_upload=datetime.now(),
                    organization_uuid=organization_uuid, project_uuid=project_uuid,
                    expire_time=expire_time,
                    max_downloads=max_downloads)

    except Exception as e:
        return {"error": True, "error_message": str(e)}

    return {"file_id": file_id}



async def service_upload_avatar(subject_uuid: UUID, file: UploadFile = File(...)):
    # Проверяем, есть ли уже аватар у пользователя
    try:
        # Получаем данные о существующем аватаре
        existing_avatar = get_avatar_data_by_id(subject_uuid)
        
        # Удаляем существующий файл аватара с сервера
        existing_file_path = f'{UPLOAD_FOLDER}/avatars/{existing_avatar["photo_uuid"]}{existing_avatar["ext"]}'
        if os.path.exists(existing_file_path):
            os.remove(existing_file_path)
    except HTTPException:
        # Если аватар не найден, продолжаем выполнение
        pass
    
    file_id = uuid4()
    filte_str_id = str(file_id)
    name, ext = os.path.splitext(file.filename)
    stored_filename = f"{filte_str_id}{ext}"
    directory_path = os.path.join(UPLOAD_FOLDER, 'avatars')

    if not os.path.exists(directory_path):
        os.makedirs(directory_path)

    file_path = os.path.join(directory_path, stored_filename)

    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        create_avatar(photo_uuid=file_id, name=name, extension=ext, subject_uuid=subject_uuid)

    except Exception as e:
        return {"error": True, "error_message": str(e)}

    return {"file_id": file_id}
