import sqlalchemy
from sqlalchemy.dialects.postgresql import UUID
import uuid
from db.organizations.base.db_session import SqlAlchemyOrgBase
from sqlalchemy_serializer import SerializerMixin


class RolePermissions(SqlAlchemyOrgBase, SerializerMixin):
    __tablename__ = "role_permission"
    __table_args__ = {"extend_existing": True}

    uuid = sqlalchemy.Column(UUID(as_uuid=True), default=uuid.uuid4, primary_key=True)
    permission = sqlalchemy.Column(sqlalchemy.Text, primary_key=True)