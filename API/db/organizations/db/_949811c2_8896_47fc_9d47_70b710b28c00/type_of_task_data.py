import sqlalchemy
from sqlalchemy import orm
from db.organizations.base.db_session import SqlAlchemyOrgBase
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.postgresql import UUID
import uuid


class TypeOfTaskData(SqlAlchemyOrgBase, SerializerMixin):
    __tablename__ = "type_of_task_data"
    __table_args__ = {"extend_existing": True}

    uuid = sqlalchemy.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    name = sqlalchemy.Column(sqlalchemy.String, primary_key=True)
    description = sqlalchemy.Column(sqlalchemy.String, nullable=True, primary_key=True)
