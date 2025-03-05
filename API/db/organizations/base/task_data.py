import sqlalchemy
from sqlalchemy import orm
from db.organizations.base.db_session import SqlAlchemyOrgBase
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.postgresql import UUID
import uuid


class TaskData(SqlAlchemyOrgBase, SerializerMixin):
    __tablename__ = "task_data"
    __table_args__ = {"extend_existing": True}

    uuid = sqlalchemy.Column(UUID(as_uuid=True), primary_key=True)
    creator = sqlalchemy.Column(UUID(as_uuid=True), primary_key=True)
    name = sqlalchemy.Column(sqlalchemy.String, primary_key=True)
    description = sqlalchemy.Column(sqlalchemy.String, nullable=True, primary_key=True)
    type = sqlalchemy.Column(UUID(as_uuid=True), primary_key=True)
    priority = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True)
    status = sqlalchemy.Column(UUID(as_uuid=True), primary_key=True)
    date = sqlalchemy.Column(sqlalchemy.Date, nullable=True)