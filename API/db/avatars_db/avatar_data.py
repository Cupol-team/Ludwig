import sqlalchemy
from sqlalchemy import orm
from .avatars_db_session import AvatarsSqlAlchemyBase
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime


class Avatar(AvatarsSqlAlchemyBase, SerializerMixin):
    __tablename__ = "avatar"

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    subject_uuid = sqlalchemy.Column(UUID(as_uuid=True), unique=True, nullable=False)
    photo_uuid = sqlalchemy.Column(UUID(as_uuid=True), unique=True, nullable=False)
    name = sqlalchemy.Column(sqlalchemy.String, nullable=False)
    extension = sqlalchemy.Column(sqlalchemy.String, nullable=False)