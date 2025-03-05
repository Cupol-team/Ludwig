import sqlalchemy
from sqlalchemy import orm
from .db_session import SqlAlchemyBase
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.postgresql import UUID
import uuid


class UserData(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "user_data"

    uuid = sqlalchemy.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    name = sqlalchemy.Column(sqlalchemy.String, primary_key=True)
    surname = sqlalchemy.Column(sqlalchemy.String, primary_key=True)
    gender = sqlalchemy.Column(sqlalchemy.String, primary_key=True)
    date_of_birthday = sqlalchemy.Column(sqlalchemy.Date, primary_key=True)
