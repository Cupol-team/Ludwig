import sqlalchemy
from sqlalchemy import orm
from db.organizations.project_base.db_session import SqlAlchemyProjBase
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.postgresql import UUID
import uuid


class RoleData(SqlAlchemyProjBase, SerializerMixin):
    __tablename__ = "role_data"
    __table_args__ = {"extend_existing": True}

    uuid = sqlalchemy.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    name = sqlalchemy.Column(sqlalchemy.String, primary_key=True)
    description = sqlalchemy.Column(sqlalchemy.String, nullable=True, primary_key=True)
