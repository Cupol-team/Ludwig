from .avatar_data import Avatar
from .avatars_db_session import avatars_global_init, avatars_create_session
from fastapi import HTTPException


def create_avatar(subject_uuid, photo_uuid, name, extension):
    try:
        session = avatars_create_session()
    except Exception as e:
        avatars_global_init('db/avatars_db/avatars_db.db')
        session = avatars_create_session()

    # Проверяем, существует ли уже аватар для этого пользователя
    existing_avatar = session.query(Avatar).filter(Avatar.subject_uuid == subject_uuid).first()
    
    if existing_avatar:
        # Обновляем существующий аватар
        existing_avatar.photo_uuid = photo_uuid
        existing_avatar.name = name
        existing_avatar.extension = extension
    else:
        # Создаем новый аватар
        avatar = Avatar()
        avatar.subject_uuid = subject_uuid
        avatar.photo_uuid = photo_uuid
        avatar.name = name
        avatar.extension = extension
        session.add(avatar)
    

    session.commit()
    session.close()


def get_avatar_data_by_id(subject_uuid):
    try:
        session = avatars_create_session()
    except Exception as e:
        avatars_global_init('db/avatars_db/avatars_db.db')
        session = avatars_create_session()

    avatar_record = session.query(Avatar).filter(Avatar.subject_uuid == subject_uuid).first()

    if not avatar_record:
        raise HTTPException(status_code=404, detail="Аватар не найден в базе данных")

    session.close()
    return {
        "subject_uuid": avatar_record.subject_uuid,
        "photo_uuid": avatar_record.photo_uuid,
        "name": avatar_record.name,
        "ext": avatar_record.extension
    }



def delete_avatar_by_id(subject_uuid):
    try:
        session = avatars_create_session()
    except Exception as e:
        avatars_global_init('db/avatars_db/avatars_db.db')
        session = avatars_create_session()

    avatar_record = session.query(Avatar).filter(Avatar.subject_uuid == subject_uuid).first()

    if not avatar_record:
        session.close()
        raise HTTPException(status_code=404, detail="Аватар не найден в базе данных")

    session.delete(avatar_record)
    session.commit()
    session.close()

    return {"message": "Аватар успешно удалён из базы данных"}
