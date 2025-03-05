import logging

import sqlalchemy as sa
import sqlalchemy.orm as orm
from sqlalchemy.orm import Session


AvatarsSqlAlchemyBase = orm.declarative_base()

__factory = None


def avatars_global_init(db_file):
    global __factory

    if __factory is not None:
        # Фабрика сессий уже создана – возвращаемся
        return

    if not db_file or not db_file.strip():
        raise Exception("Необходимо указать файл базы данных.")

    conn_str = f'sqlite:///{db_file.strip()}?check_same_thread=False'
    print(f"Подключение к базе данных по адресу {conn_str}")

    uploads_engine = sa.create_engine(conn_str, echo=False)
    session_factory = orm.sessionmaker(bind=uploads_engine)
    __factory = orm.scoped_session(session_factory)

    AvatarsSqlAlchemyBase.metadata.create_all(uploads_engine)


def avatars_create_session() -> Session:
    global __factory
    if __factory is None:
        raise Exception("Сначала нужно вызвать global_init() для инициализации базы данных.")
    return __factory()
