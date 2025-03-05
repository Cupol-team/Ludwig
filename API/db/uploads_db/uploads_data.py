import sqlalchemy
from sqlalchemy import orm
from .uploads_db_session import UploadsSqlAlchemyBase
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime


class File(UploadsSqlAlchemyBase, SerializerMixin):
    __tablename__ = "file"

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    uuid = sqlalchemy.Column(UUID(as_uuid=True), unique=True, nullable=False)
    name = sqlalchemy.Column(sqlalchemy.String, nullable=False)
    size = sqlalchemy.Column(sqlalchemy.BigInteger, nullable=False)
    extension = sqlalchemy.Column(sqlalchemy.String, nullable=False)
    time_upload = sqlalchemy.Column(sqlalchemy.DateTime, nullable=False)
    who_upload = sqlalchemy.Column(UUID(as_uuid=True), nullable=False)
    organization_uuid = sqlalchemy.Column(UUID(as_uuid=True), nullable=False)
    project_uuid = sqlalchemy.Column(UUID(as_uuid=True), nullable=False)
    expire_time = sqlalchemy.Column(sqlalchemy.String, nullable=True)
    number_downloads = sqlalchemy.Column(sqlalchemy.Integer, default=0, nullable=False)
    max_downloads = sqlalchemy.Column(sqlalchemy.Integer, nullable=True)