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


class PasswordRecoveryRequestIn(BaseModel):
    account_type: LoginRole
    identifier: str = Field(..., min_length=1, max_length=200)


class PasswordRecoveryRequestOut(BaseModel):
    ok: bool = True
    masked_contact: str
    message: str
    demo_code: str = "123456"


class PasswordRecoveryConfirmIn(PasswordRecoveryRequestIn):
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6, max_length=100)


class PasswordRecoveryConfirmOut(BaseModel):
    ok: bool = True
    message: str
