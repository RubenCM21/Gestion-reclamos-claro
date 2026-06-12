from datetime import datetime

from pydantic import Field

from schemas.base_model import BaseModel


class AdvisorProfileOut(BaseModel):
    id: str
    name: str
    initials: str
    role: str
    status: str = "Disponible"
    shift: str = "Turno operativo"
    last_access: str


class AdvisorKpiOut(BaseModel):
    key: str
    value: int | float
    label: str


class AdvisorCatalogItemOut(BaseModel):
    id: int
    name: str


class AdvisorCatalogsOut(BaseModel):
    areas: list[AdvisorCatalogItemOut]
    priorities: list[AdvisorCatalogItemOut]
    statuses: list[AdvisorCatalogItemOut]


class CaseHistoryOut(BaseModel):
    id: int
    action: str
    summary: str | None
    observation: str
    previous_status: str | None
    new_status: str | None
    visible_customer: bool
    user_name: str | None
    event_at: datetime


class CaseEvidenceOut(BaseModel):
    id: int
    file_name: str
    file_path: str
    mime_type: str
    size_bytes: int
    description: str | None
    uploaded_at: datetime


class AdvisorCaseOut(BaseModel):
    code: str
    case_type: str
    client_type: str
    client_name: str
    document: str
    title: str
    description: str
    category: str
    service: str
    channel: str
    priority: str
    status: str
    queue_status: str
    area: str | None
    sla_hours: float | None
    sla_text: str
    sla_group: str
    registered_at: datetime
    updated_at: datetime
    resolution_due_at: datetime | None
    pending_customer: bool
    action: str


class AdvisorCaseDetailOut(AdvisorCaseOut):
    final_solution: str | None
    history: list[CaseHistoryOut]
    evidence: list[CaseEvidenceOut]


class AdvisorCasesOut(BaseModel):
    total: int
    items: list[AdvisorCaseOut]


class AdvisorActivityOut(BaseModel):
    case_code: str
    action: str
    summary: str | None
    observation: str
    event_at: datetime


class AdvisorDashboardOut(BaseModel):
    advisor: AdvisorProfileOut
    kpis: list[AdvisorKpiOut]
    priority_cases: list[AdvisorCaseOut]
    sla_cases: list[AdvisorCaseOut]
    queue_counts: dict[str, int]
    recent_activity: list[AdvisorActivityOut]


class CaseUpdateIn(BaseModel):
    status: str = Field(..., min_length=1, max_length=100)
    visibility: str = Field(..., min_length=1, max_length=40)
    summary: str = Field(..., min_length=3, max_length=220)
    detail: str = Field(..., min_length=3, max_length=4000)
    declaration: bool


class CustomerInformationRequestIn(BaseModel):
    channel: str = Field(..., min_length=1, max_length=60)
    deadline: str = Field(..., min_length=1, max_length=40)
    subject: str = Field(..., min_length=3, max_length=220)
    message: str = Field(..., min_length=3, max_length=4000)
    declaration: bool


class CaseDeriveIn(BaseModel):
    area: str = Field(..., min_length=1, max_length=120)
    priority: str = Field(..., min_length=1, max_length=60)
    reason: str = Field(..., min_length=3, max_length=4000)


class CaseCloseIn(BaseModel):
    response: str = Field(..., min_length=10, max_length=6000)
    declaration: bool


class SlaReminderIn(BaseModel):
    channel: str = Field(..., min_length=1, max_length=60)
    deadline: str = Field(..., min_length=1, max_length=40)
    message: str = Field(..., min_length=3, max_length=4000)
    declaration: bool


class SlaFollowUpIn(BaseModel):
    detail: str = Field(..., min_length=3, max_length=4000)
    declaration: bool


class EvidenceIn(BaseModel):
    file_name: str = Field(..., min_length=1, max_length=250)
    file_path: str = Field(..., min_length=1, max_length=500)
    mime_type: str = Field(..., min_length=1, max_length=150)
    size_bytes: int = Field(ge=0)
    description: str | None = Field(default=None, max_length=300)


class AdvisorActionOut(BaseModel):
    ok: bool = True
    message: str
    case: AdvisorCaseDetailOut


class ResponseTemplateOut(BaseModel):
    id: int
    code: str
    name: str
    category: str
    channel: str
    description: str | None
    body: str
    active: bool


class ResponseTemplatesOut(BaseModel):
    total: int
    items: list[ResponseTemplateOut]


class ResponseTemplateCreateIn(BaseModel):
    name: str = Field(..., min_length=3, max_length=160)
    category: str = Field(..., min_length=1, max_length=60)
    channel: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=250)
    body: str = Field(..., min_length=10, max_length=6000)
    declaration: bool


class TemplateSendIn(BaseModel):
    case_code: str = Field(..., min_length=1, max_length=40)
    channel: str = Field(..., min_length=1, max_length=60)
    message: str = Field(..., min_length=3, max_length=6000)
    declaration: bool


class AdvisorNotificationOut(BaseModel):
    id: int
    case_code: str | None
    notification_type: str
    channel: str
    title: str
    message: str
    priority: str
    read: bool
    generated_at: datetime
    read_at: datetime | None


class AdvisorNotificationsOut(BaseModel):
    total: int
    unread: int
    items: list[AdvisorNotificationOut]


class NotificationActionOut(BaseModel):
    ok: bool = True
    affected: int


class PerformanceBreakdownOut(BaseModel):
    label: str
    total: int


class AdvisorPerformanceOut(BaseModel):
    period: str
    assigned_cases: int
    attended_cases: int
    closed_cases: int
    sla_compliance_percent: float
    average_resolution_hours: float | None
    by_type: list[PerformanceBreakdownOut]
    by_priority: list[PerformanceBreakdownOut]
