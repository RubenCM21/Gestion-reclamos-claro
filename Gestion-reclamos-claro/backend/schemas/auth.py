from enum import Enum
from uuid import UUID

from pydantic import Field

from schemas.base_model import BaseModel


class LoginRole(str, Enum):
    CLIENT_PERSON = "cliente-persona"
    CLIENT_COMPANY = "cliente-empresa"
    OPERATOR = "asesor"
    SUPERVISOR = "supervisor"
    ADMIN = "admin"


class LoginIn(BaseModel):
    username: str = Field(..., min_length=1, max_length=200)
    password: str = Field(..., min_length=4, max_length=100)
    role: LoginRole
    remember_me: bool = False


class SessionUserOut(BaseModel):
    id: UUID
    name: str
    role: LoginRole
    username: str


class LoginOut(BaseModel):
    ok: bool = True
    token: str
    user: SessionUserOut
    redirect: str


class SessionOut(BaseModel):
    active: bool = True
    user: SessionUserOut


class LogoutOut(BaseModel):
    ok: bool = True
