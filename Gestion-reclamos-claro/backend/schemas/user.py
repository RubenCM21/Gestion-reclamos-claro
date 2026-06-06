from uuid import UUID

from django.db import models
from pydantic import Field

from dao.models.enums import UserRole
from schemas.base_model import BaseModel


class UserAuth(BaseModel):
    id: UUID
    username: str
    hashed_password: str
    full_name: str
    role: UserRole


class UserOut(BaseModel):
    id: UUID
    username: str
    full_name: str
    role: UserRole


class UsersOut(BaseModel):
    users: list[UserOut]


class UserIn(BaseModel):
    username: str = Field(..., max_length=60, min_length=1)
    password: str = Field(..., max_length=100, min_length=1)
    full_name: str = Field(..., max_length=60, min_length=1)


class UserRolesToCreate(models.TextChoices):
    OPERATOR = "OPERATOR", "Operator"
    SUPERVISOR = "SUPERVISOR", "Supervisor"
