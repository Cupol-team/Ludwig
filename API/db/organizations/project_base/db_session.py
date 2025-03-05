import logging

import sqlalchemy as sa
import sqlalchemy.orm as orm
from sqlalchemy.orm import Session


SqlAlchemyProjBase = orm.declarative_base()

__factory = None


def global_init(db_file):
    global __factory

    if __factory is not None:
        # Фабрика сессий уже создана – возвращаемся
        return

    if not db_file or not db_file.strip():
        raise Exception("Необходимо указать файл базы данных.")

    conn_str = f'sqlite:///{db_file.strip()}?check_same_thread=False'
    print(f"Подключение к базе данных по адресу {conn_str}")

    engine = sa.create_engine(conn_str, echo=False)
    session_factory = orm.sessionmaker(bind=engine)
    __factory = orm.scoped_session(session_factory)

    SqlAlchemyProjBase.metadata.create_all(engine)


def create_session() -> Session:
    global __factory
    if __factory is None:
        raise Exception("Сначала нужно вызвать global_init() для инициализации базы данных.")
    return __factory()
