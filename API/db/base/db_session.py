import logging
import sqlalchemy as sa
import sqlalchemy.orm as orm
from sqlalchemy.orm import Session


SqlAlchemyBase = orm.declarative_base()

__factory = None


def global_init(db_file):
    """
    Инициализация подключения к базе данных.
    Если уже была произведена инициализация, повторный вызов не создаст новый движок.
    """
    global __factory
    if __factory is not None:
        # Если фабрика сессий уже создана – выходим
        return

    if not db_file or not db_file.strip():
        raise Exception("Необходимо указать файл базы данных.")

    conn_str = f'sqlite:///{db_file.strip()}?check_same_thread=False'
    print(f"Подключение к базе данных по адресу {conn_str}")

    # Создаем движок один раз
    engine = sa.create_engine(conn_str, echo=False)

    # Создаем фабрику сессий
    session_factory = orm.sessionmaker(bind=engine)
    # Использование scoped_session позволяет возвращать один и тот же объект сессии
    __factory = orm.scoped_session(session_factory)
    
    # Создаем все таблицы, если их еще нет
    SqlAlchemyBase.metadata.create_all(engine)


def create_session() -> Session:
    """
    Возвращает сессию для работы с базой данных.
    Если фабрика не инициализирована, выбрасывается исключение.
    """
    global __factory
    if __factory is None:
        raise Exception("Сначала нужно вызвать global_init() для инициализации базы данных.")
    return __factory()
