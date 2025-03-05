import sqlalchemy
from sqlalchemy import orm
from db.organizations.base.db_session import SqlAlchemyOrgBase
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.postgresql import UUID
import uuid


class User(SqlAlchemyOrgBase, SerializerMixin):
    __tablename__ = "user"
    __table_args__ = {"extend_existing": True}

    uuid = sqlalchemy.Column(UUID(as_uuid=True), primary_key=True)
    role = sqlalchemy.Column(UUID(as_uuid=True), primary_key=True)
