import sqlalchemy
from sqlalchemy import orm
from db.organizations.base.db_session import SqlAlchemyOrgBase
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.postgresql import UUID
import uuid


class Task(SqlAlchemyOrgBase, SerializerMixin):
    __tablename__ = "task"
    __table_args__ = {"extend_existing": True}

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    uuid = sqlalchemy.Column(UUID(as_uuid=True), default=uuid.uuid4)
