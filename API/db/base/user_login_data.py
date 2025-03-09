import sqlalchemy
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import generate_password_hash, check_password_hash

import uuid

from .db_session import SqlAlchemyBase


class UserLoginData(SqlAlchemyBase, SerializerMixin):
    """
    Модель для хранения данных авторизации пользователя.
    """
    __tablename__ = "user_login_data"

    uuid = sqlalchemy.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True, unique=True, nullable=False)
    email = sqlalchemy.Column(sqlalchemy.String(255), unique=True, nullable=False)
    password = sqlalchemy.Column(sqlalchemy.String, nullable=False)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        print(self.password)
        print(generate_password_hash(password))
        return check_password_hash(self.password, password) # TODO: Расскоментить после всех тестов
        return self.password == password
