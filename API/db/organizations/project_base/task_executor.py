import sqlalchemy
from sqlalchemy import orm
from db.organizations.project_base.db_session import SqlAlchemyProjBase
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.postgresql import UUID
import uuid


class TaskExecutor(SqlAlchemyProjBase, SerializerMixin):
    __tablename__ = "task_executor"
    __table_args__ = {"extend_existing": True}

    user_uuid = sqlalchemy.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    task_uuid = sqlalchemy.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
