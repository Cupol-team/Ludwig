import os

from .uploads_data import File
from .uploads_db_session import uploads_global_init, uploads_create_session
from datetime import datetime
from sqlalchemy import delete, and_, cast, DateTime
import pytz
from fastapi import HTTPException


def create_file(file_uuid, name, size, extension, who_upload, time_upload, organization_uuid, project_uuid,
                expire_time=None,
                max_downloads=None):
    file = File()
    file.uuid = file_uuid
    file.name = name
    file.size = size
    file.extension = extension
    file.time_upload = time_upload
    file.who_upload = who_upload
    file.organization_uuid = organization_uuid
    file.project_uuid = project_uuid
    file.expire_time = expire_time
    file.max_downloads = max_downloads

    try:
        session = uploads_create_session()
    except Exception as e:
        uploads_global_init('db/uploads_db/uploads_db.db')
        session = uploads_create_session()

    session.add(file)
    session.commit()
    session.close()


def get_files_by_project(project_uuid):
    def delete_expired_or_maxed_out_files(sess):
        now_unix = int(datetime.utcnow().replace(tzinfo=pytz.utc).timestamp())

        expired_files = sess.query(File).filter(File.expire_time.isnot(None)).all()

        files_to_delete = [file for file in expired_files if int(file.expire_time) < now_unix]

        maxed_out_files = sess.query(File).filter(
            (File.max_downloads.isnot(None)) & (File.number_downloads >= File.max_downloads)
        ).all()

        files_to_delete.extend(maxed_out_files)

        for file in files_to_delete:
            sess.delete(file)

        sess.commit()

    try:
        session = uploads_create_session()
    except Exception as e:
        uploads_global_init('db/uploads_db/uploads_db.db')
        session = uploads_create_session()

    try:
        delete_expired_or_maxed_out_files(session)
        session.close()
        return session.query(File).filter(File.project_uuid == project_uuid).all()
    except Exception as e:
        return e


def get_file_data_by_id(file_id):
    try:
        session = uploads_create_session()
    except Exception as e:
        uploads_global_init('db/uploads_db/uploads_db.db')
        session = uploads_create_session()

    file_record = session.query(File).filter(File.uuid == file_id).first()

    if not file_record:
        raise HTTPException(status_code=404, detail="Файл не найден в базе данных")

    session.close()
    return {
        "organization_uuid": file_record.organization_uuid,
        "project_uuid": file_record.project_uuid,
        "name": file_record.name,
        "ext": file_record.extension
    }


def increment_download_count(file_id):
    try:
        session = uploads_create_session()
    except Exception as e:
        uploads_global_init('db/uploads_db/uploads_db.db')
        session = uploads_create_session()

    file_record = session.query(File).filter(File.uuid == file_id).first()

    if not file_record:
        return False

    file_record.number_downloads += 1
    session.commit()
    session.close()
    return True


def delete_file_by_id(file_id):
    try:
        session = uploads_create_session()
    except Exception as e:
        uploads_global_init('db/uploads_db/uploads_db.db')
        session = uploads_create_session()

    file_record = session.query(File).filter(File.uuid == file_id).first()

    if not file_record:
        session.close()
        raise HTTPException(status_code=404, detail="Файл не найден в базе данных")

    session.delete(file_record)
    session.commit()
    session.close()

    return {"message": "Файл успешно удалён из базы данных"}
