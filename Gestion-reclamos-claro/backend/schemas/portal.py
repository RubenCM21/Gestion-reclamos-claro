from pydantic import Field

from schemas.auth import LoginRole
from schemas.base_model import BaseModel


class RegisterIn(BaseModel):
    account_type: str = Field(..., min_length=1, max_length=20)
    document_type: str = Field(..., min_length=1, max_length=20)
    document_number: str = Field(..., min_length=4, max_length=30)
    first_name: str | None = Field(default=None, max_length=120)
    last_name: str | None = Field(default=None, max_length=120)
    business_name: str | None = Field(default=None, max_length=200)
    representative_name: str | None = Field(default=None, max_length=200)
    email: str = Field(..., min_length=3, max_length=200)
    phone: str | None = Field(default=None, max_length=30)
    address: str | None = Field(default=None, max_length=250)
    service_type: str | None = Field(default=None, max_length=100)
    service_number: str | None = Field(default=None, max_length=80)
    plan_type: str | None = Field(default=None, max_length=120)
    password: str = Field(..., min_length=4, max_length=100)


class RegisterOut(BaseModel):
    ok: bool = True
    username: str
    role: LoginRole
    message: str


class CaseCreateIn(BaseModel):
    title: str = Field(..., min_length=3, max_length=220)
    description: str = Field(..., min_length=3, max_length=4000)
    service: str = Field(..., min_length=1, max_length=100)
    category: str | None = Field(default=None, max_length=120)
    priority: str | None = Field(default=None, max_length=60)
    channel: str = Field(default="Portal cliente", max_length=60)


class ActionOut(BaseModel):
    ok: bool = True
    message: str
    code: str | None = None
