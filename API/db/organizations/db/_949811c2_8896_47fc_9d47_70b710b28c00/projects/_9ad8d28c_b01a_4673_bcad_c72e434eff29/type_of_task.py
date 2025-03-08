import sqlalchemy
from sqlalchemy import orm
from db.organizations.project_base.db_session import SqlAlchemyProjBase
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.postgresql import UUID
import uuid


class TypeOfTask(SqlAlchemyProjBase, SerializerMixin):
    __tablename__ = "type_of_task"
    __table_args__ = {"extend_existing": True}

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    uuid = sqlalchemy.Column(UUID(as_uuid=True), default=uuid.uuid4)
