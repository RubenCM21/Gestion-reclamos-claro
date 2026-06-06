from enum import Enum

from pydantic import Field

from schemas.base_model import BaseModel


class CustomerSegment(str, Enum):
    PERSONAS = "personas"
    EMPRESAS = "empresas"


class ServiceCode(str, Enum):
    MOBILE = "movil"
    HOME = "hogar"
    BUSINESS = "empresa"


class HomeHeroOut(BaseModel):
    eyebrow: str
    title: str
    description: str
    primary_text: str
    primary_href: str
    panel_title: str
    status_text: str


class HomeActionOut(BaseModel):
    code: str
    label: str
    href: str


class HomeServiceOut(BaseModel):
    id: int
    code: ServiceCode
    name: str
    description: str | None
    active: bool
    status_text: str
    actions: list[HomeActionOut] = Field(default_factory=list)


class HomeOut(BaseModel):
    segment: CustomerSegment
    hero: HomeHeroOut
    services: list[HomeServiceOut]
