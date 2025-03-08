import sqlalchemy
from sqlalchemy import orm
from db.organizations.base.db_session import SqlAlchemyOrgBase
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.postgresql import UUID
import uuid


class TaskExecutor(SqlAlchemyOrgBase, SerializerMixin):
    __tablename__ = "task_executor"
    __table_args__ = {"extend_existing": True}

    user_uuid = sqlalchemy.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    task_uuid = sqlalchemy.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
