import re
from collections import Counter
from datetime import timedelta
from uuid import uuid4

from django.db import transaction
from django.db.models import F, Q
from django.utils import timezone

from dao.models import (
    AdvisorNotification,
    Area,
    Case,
    CaseAssignment,
    CaseCommunication,
    CaseEvidence,
    CaseHistory,
    CasePriority,
    CaseStatus,
    ResponseTemplate,
    UserModel,
)
from schemas.advisor import (
    AdvisorActionOut,
    AdvisorActivityOut,
    AdvisorCaseDetailOut,
    AdvisorCaseOut,
    AdvisorCasesOut,
    AdvisorCatalogItemOut,
    AdvisorCatalogsOut,
    AdvisorDashboardOut,
    AdvisorKpiOut,
    AdvisorNotificationOut,
    AdvisorNotificationsOut,
    AdvisorPerformanceOut,
    AdvisorProfileOut,
    CaseCloseIn,
    CaseDeriveIn,
    CaseEvidenceOut,
    CaseHistoryOut,
    CaseUpdateIn,
    CustomerInformationRequestIn,
    EvidenceIn,
    NotificationActionOut,
    PerformanceBreakdownOut,
    ResponseTemplateCreateIn,
    ResponseTemplateOut,
    ResponseTemplatesOut,
    SlaFollowUpIn,
    SlaReminderIn,
    TemplateSendIn,
)


class AdvisorCaseNotFoundError(LookupError):
    pass


class AdvisorResourceNotFoundError(LookupError):
    pass


class AdvisorValidationError(ValueError):
    pass


STATUS_ALIASES = {
    "nuevo": "Registrado",
    "registrado": "Registrado",
    "pendiente de clasificacion": "Pendiente de clasificación",
    "en atencion": "En atención",
    "en revision tecnica": "En atención",
    "pendiente cliente": "Pendiente por cliente",
    "pendiente por cliente": "Pendiente por cliente",
    "derivado": "Escalado",
    "escalado": "Escalado",
    "listo para cierre": "Resuelto",
    "resuelto": "Resuelto",
    "cerrado": "Cerrado",
}

QUEUE_STATUS_BY_STATUS = {
    "Registrado": "Nuevo",
    "Pendiente de clasificación": "Nuevo",
    "En atención": "En atención",
    "Pendiente por cliente": "Pendiente cliente",
    "Escalado": "Derivado",
    "Resuelto": "Listo para cierre",
    "Cerrado": "Cerrado",
}


def fetch_catalogs() -> AdvisorCatalogsOut:
    return AdvisorCatalogsOut(
        areas=[
            AdvisorCatalogItemOut(id=item.id, name=item.name)
            for item in Area.objects.filter(active=True)
        ],
        priorities=[
            AdvisorCatalogItemOut(id=item.id, name=item.name)
            for item in CasePriority.objects.filter(active=True)
        ],
        statuses=[
            AdvisorCatalogItemOut(id=item.id, name=item.name)
            for item in CaseStatus.objects.filter(active=True)
        ],
    )


def fetch_dashboard(advisor: UserModel) -> AdvisorDashboardOut:
    cases = list(_case_queryset(advisor))
    open_cases = [case for case in cases if not case.status.final]
    critical = [case for case in open_cases if _plain(case.priority.name) == "critica"]
    sla_cases = [case for case in open_cases if _sla_hours(case) is not None and _sla_hours(case) <= 8]
    ready_to_close = [
        case for case in open_cases if _queue_status(case.status.name) == "Listo para cierre"
    ]

    queue_counts = Counter(_queue_status(case.status.name) for case in open_cases)
    activity = (
        CaseHistory.objects.filter(case__responsible=advisor)
        .select_related("case")
        .order_by("-event_at")[:8]
    )

    return AdvisorDashboardOut(
        advisor=_advisor_profile(advisor),
        kpis=[
            AdvisorKpiOut(key="assigned", value=len(open_cases), label="Casos asignados"),
            AdvisorKpiOut(key="critical", value=len(critical), label="Criticos"),
            AdvisorKpiOut(key="sla_risk", value=len(sla_cases), label="Riesgo SLA"),
            AdvisorKpiOut(
                key="ready_to_close",
                value=len(ready_to_close),
                label="Listos para cierre",
            ),
        ],
        priority_cases=[
            _case_out(case)
            for case in sorted(open_cases, key=_case_sort_key)[:5]
        ],
        sla_cases=[
            _case_out(case) for case in sorted(sla_cases, key=_case_sort_key)
        ],
        queue_counts=dict(queue_counts),
        recent_activity=[
            AdvisorActivityOut(
                case_code=item.case.code,
                action=item.action,
                summary=item.summary,
                observation=item.observation,
                event_at=item.event_at,
            )
            for item in activity
        ],
    )


def fetch_cases(
    advisor: UserModel,
    search: str | None = None,
    priority: str | None = None,
    status: str | None = None,
    queue_status: str | None = None,
    sla_risk: bool = False,
) -> AdvisorCasesOut:
    queryset = _case_queryset(advisor)

    if search:
        queryset = queryset.filter(
            Q(code__icontains=search)
            | Q(title__icontains=search)
            | Q(description__icontains=search)
            | Q(customer__first_name__icontains=search)
            | Q(customer__last_name__icontains=search)
            | Q(customer__business_name__icontains=search)
            | Q(customer__document_number__icontains=search)
            | Q(service__name__icontains=search)
        )
    if priority:
        queryset = queryset.filter(priority__name__iexact=priority)
    if status:
        queryset = queryset.filter(status__name__iexact=_normalized_status_name(status))
    if queue_status:
        status_names = [
            name
            for name, mapped_queue in QUEUE_STATUS_BY_STATUS.items()
            if _plain(mapped_queue) == _plain(queue_status)
        ]
        queryset = queryset.filter(status__name__in=status_names)
    if sla_risk:
        queryset = queryset.filter(
            status__final=False,
            resolution_due_at__lte=timezone.now() + timedelta(hours=8),
        )

    items = list(queryset)
    return AdvisorCasesOut(total=len(items), items=[_case_out(item) for item in items])


def fetch_case_detail(advisor: UserModel, case_code: str) -> AdvisorCaseDetailOut:
    return _case_detail(_get_case(advisor, case_code))


@transaction.atomic
def update_case(
    advisor: UserModel, case_code: str, payload: CaseUpdateIn
) -> AdvisorActionOut:
    _require_declaration(payload.declaration)
    case = _get_case(advisor, case_code, for_update=True)
    _ensure_case_open(case)
    status = _get_status(payload.status)

    if status.final:
        raise AdvisorValidationError(
            "Usa el endpoint de cierre para cerrar un caso con respuesta final."
        )

    previous_status = case.status
    case.status = status
    case.pending_customer = status.name == "Pendiente por cliente"
    case.save(update_fields=["status", "pending_customer", "updated_at"])

    _create_history(
        case=case,
        user=advisor,
        previous_status=previous_status,
        new_status=status,
        action="ACTUALIZACION_ATENCION",
        summary=payload.summary,
        observation=payload.detail,
        visible_customer=_is_customer_visible(payload.visibility),
    )
    return _action_response("La actualizacion fue registrada.", case)


@transaction.atomic
def request_customer_information(
    advisor: UserModel,
    case_code: str,
    payload: CustomerInformationRequestIn,
) -> AdvisorActionOut:
    _require_declaration(payload.declaration)
    case = _get_case(advisor, case_code, for_update=True)
    _ensure_case_open(case)
    previous_status = case.status
    pending_status = _get_status("Pendiente por cliente")
    deadline_at = _deadline_from_text(payload.deadline)

    case.status = pending_status
    case.pending_customer = True
    case.save(update_fields=["status", "pending_customer", "updated_at"])

    CaseCommunication.objects.create(
        case=case,
        user=advisor,
        communication_type=CaseCommunication.CommunicationType.INFORMATION_REQUEST,
        channel=payload.channel,
        subject=payload.subject,
        message=payload.message,
        deadline_at=deadline_at,
    )
    _create_history(
        case=case,
        user=advisor,
        previous_status=previous_status,
        new_status=pending_status,
        action="SOLICITUD_INFORMACION",
        summary=payload.subject,
        observation=payload.message,
        visible_customer=True,
    )
    _notify_customer(
        case,
        notification_type="SOLICITUD_INFORMACION",
        channel=payload.channel,
        title=payload.subject,
        message=payload.message,
        priority="alta",
    )
    return _action_response("La solicitud fue registrada y enviada.", case)


@transaction.atomic
def derive_case(
    advisor: UserModel, case_code: str, payload: CaseDeriveIn
) -> AdvisorActionOut:
    case = _get_case(advisor, case_code, for_update=True)
    _ensure_case_open(case)
    area = Area.objects.filter(name__iexact=payload.area, active=True).first()
    if area is None:
        raise AdvisorResourceNotFoundError("El area destino no existe o esta inactiva.")

    priority = CasePriority.objects.filter(
        name__iexact=payload.priority, active=True
    ).first()
    if priority is None:
        raise AdvisorResourceNotFoundError("La prioridad no existe o esta inactiva.")

    previous_status = case.status
    previous_area = case.current_area
    escalated_status = _get_status("Escalado")

    CaseAssignment.objects.create(
        case=case,
        source_user=advisor,
        source_area=previous_area,
        destination_area=area,
        assigned_by=advisor,
        movement_type="DERIVACION",
        reason=payload.reason,
    )
    case.current_area = area
    case.priority = priority
    case.status = escalated_status
    case.pending_customer = False
    case.save(
        update_fields=[
            "current_area",
            "priority",
            "status",
            "pending_customer",
            "updated_at",
        ]
    )
    _create_history(
        case=case,
        user=advisor,
        previous_status=previous_status,
        new_status=escalated_status,
        action="DERIVACION_CASO",
        summary=f"Derivacion a {area.name}",
        observation=payload.reason,
        visible_customer=True,
    )
    return _action_response("El caso fue derivado correctamente.", case)


@transaction.atomic
def close_case(
    advisor: UserModel, case_code: str, payload: CaseCloseIn
) -> AdvisorActionOut:
    _require_declaration(payload.declaration)
    case = _get_case(advisor, case_code, for_update=True)
    _ensure_case_open(case)
    previous_status = case.status
    closed_status = _get_status("Cerrado")
    now = timezone.now()

    case.status = closed_status
    case.closed_by = advisor
    case.closed_at = now
    case.final_solution = payload.response
    case.pending_customer = False
    case.save(
        update_fields=[
            "status",
            "closed_by",
            "closed_at",
            "final_solution",
            "pending_customer",
            "updated_at",
        ]
    )
    _create_history(
        case=case,
        user=advisor,
        previous_status=previous_status,
        new_status=closed_status,
        action="CIERRE_CASO",
        summary="Caso cerrado con respuesta final",
        observation=payload.response,
        visible_customer=True,
    )
    _notify_customer(
        case,
        notification_type="CIERRE",
        channel="SISTEMA",
        title=f"Caso {case.code} cerrado",
        message=payload.response,
        priority="media",
    )
    return _action_response("El caso fue cerrado correctamente.", case)


@transaction.atomic
def add_evidence(
    advisor: UserModel, case_code: str, payload: EvidenceIn
) -> AdvisorActionOut:
    case = _get_case(advisor, case_code, for_update=True)
    _ensure_case_open(case)
    history = _create_history(
        case=case,
        user=advisor,
        previous_status=case.status,
        new_status=case.status,
        action="EVIDENCIA_ADJUNTADA",
        summary=payload.file_name,
        observation=payload.description or "Evidencia adjuntada por el asesor.",
        visible_customer=True,
    )
    CaseEvidence.objects.create(
        case=case,
        history=history,
        user=advisor,
        file_name=payload.file_name,
        file_path=payload.file_path,
        mime_type=payload.mime_type,
        size_bytes=payload.size_bytes,
        description=payload.description,
    )
    return _action_response("La evidencia fue registrada.", case)


@transaction.atomic
def send_sla_reminder(
    advisor: UserModel, case_code: str, payload: SlaReminderIn
) -> AdvisorActionOut:
    _require_declaration(payload.declaration)
    case = _get_case(advisor, case_code, for_update=True)
    _ensure_case_open(case)
    deadline_at = _deadline_from_text(payload.deadline)

    CaseCommunication.objects.create(
        case=case,
        user=advisor,
        communication_type=CaseCommunication.CommunicationType.SLA_REMINDER,
        channel=payload.channel,
        subject=f"Recordatorio del caso {case.code}",
        message=payload.message,
        deadline_at=deadline_at,
    )
    _create_history(
        case=case,
        user=advisor,
        previous_status=case.status,
        new_status=case.status,
        action="RECORDATORIO_SLA",
        summary="Recordatorio SLA enviado",
        observation=payload.message,
        visible_customer=True,
    )
    _notify_customer(
        case,
        notification_type="RECORDATORIO_SLA",
        channel=payload.channel,
        title=f"Recordatorio del caso {case.code}",
        message=payload.message,
        priority="alta",
    )
    return _action_response("El recordatorio SLA fue enviado.", case)


@transaction.atomic
def register_sla_follow_up(
    advisor: UserModel, case_code: str, payload: SlaFollowUpIn
) -> AdvisorActionOut:
    _require_declaration(payload.declaration)
    case = _get_case(advisor, case_code, for_update=True)
    _ensure_case_open(case)
    _create_history(
        case=case,
        user=advisor,
        previous_status=case.status,
        new_status=case.status,
        action="SEGUIMIENTO_SLA",
        summary="Seguimiento SLA",
        observation=payload.detail,
        visible_customer=False,
    )
    return _action_response("El seguimiento SLA fue registrado.", case)


def fetch_templates(
    search: str | None = None, category: str | None = None
) -> ResponseTemplatesOut:
    queryset = ResponseTemplate.objects.filter(active=True)
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search)
            | Q(description__icontains=search)
            | Q(body__icontains=search)
        )
    if category:
        queryset = queryset.filter(category__iexact=category)
    items = list(queryset)
    return ResponseTemplatesOut(
        total=len(items), items=[_template_out(item) for item in items]
    )


@transaction.atomic
def create_template(
    advisor: UserModel, payload: ResponseTemplateCreateIn
) -> ResponseTemplateOut:
    _require_declaration(payload.declaration)
    template = ResponseTemplate.objects.create(
        code=f"TPL-{uuid4().hex[:8].upper()}",
        name=payload.name,
        category=payload.category.lower(),
        channel=payload.channel,
        description=payload.description,
        body=payload.body,
        created_by=advisor,
    )
    return _template_out(template)


@transaction.atomic
def send_template(
    advisor: UserModel, template_id: int, payload: TemplateSendIn
) -> AdvisorActionOut:
    _require_declaration(payload.declaration)
    template = ResponseTemplate.objects.filter(id=template_id, active=True).first()
    if template is None:
        raise AdvisorResourceNotFoundError("La plantilla no existe o esta inactiva.")

    case = _get_case(advisor, payload.case_code, for_update=True)
    _ensure_case_open(case)
    CaseCommunication.objects.create(
        case=case,
        user=advisor,
        communication_type=CaseCommunication.CommunicationType.TEMPLATE_RESPONSE,
        channel=payload.channel,
        subject=template.name,
        message=payload.message,
    )
    _create_history(
        case=case,
        user=advisor,
        previous_status=case.status,
        new_status=case.status,
        action="RESPUESTA_PLANTILLA",
        summary=template.name,
        observation=payload.message,
        visible_customer=True,
    )
    _notify_customer(
        case,
        notification_type="RESPUESTA_ASESOR",
        channel=payload.channel,
        title=template.name,
        message=payload.message,
        priority="media",
    )
    return _action_response("La plantilla fue aplicada y enviada.", case)


def fetch_notifications(
    advisor: UserModel,
    search: str | None = None,
    notification_type: str | None = None,
    priority: str | None = None,
    unread_only: bool = False,
) -> AdvisorNotificationsOut:
    queryset = AdvisorNotification.objects.filter(user=advisor).select_related("case")
    if search:
        queryset = queryset.filter(
            Q(title__icontains=search)
            | Q(message__icontains=search)
            | Q(case__code__icontains=search)
        )
    if notification_type:
        queryset = queryset.filter(notification_type__iexact=notification_type)
    if priority:
        queryset = queryset.filter(priority__iexact=priority)
    if unread_only:
        queryset = queryset.filter(read=False)

    items = list(queryset)
    return AdvisorNotificationsOut(
        total=len(items),
        unread=AdvisorNotification.objects.filter(user=advisor, read=False).count(),
        items=[_notification_out(item) for item in items],
    )


def mark_notification_read(
    advisor: UserModel, notification_id: int
) -> AdvisorNotificationOut:
    notification = AdvisorNotification.objects.filter(
        id=notification_id, user=advisor
    ).select_related("case").first()
    if notification is None:
        raise AdvisorResourceNotFoundError("La notificacion no existe.")

    if not notification.read:
        notification.read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=["read", "read_at"])
    return _notification_out(notification)


def mark_all_notifications_read(advisor: UserModel) -> NotificationActionOut:
    affected = AdvisorNotification.objects.filter(user=advisor, read=False).update(
        read=True, read_at=timezone.now()
    )
    return NotificationActionOut(affected=affected)


def delete_read_notifications(advisor: UserModel) -> NotificationActionOut:
    queryset = AdvisorNotification.objects.filter(user=advisor, read=True)
    affected = queryset.count()
    queryset.delete()
    return NotificationActionOut(affected=affected)


def fetch_performance(advisor: UserModel, period: str) -> AdvisorPerformanceOut:
    now = timezone.now()
    if period == "month":
        start = now - timedelta(days=30)
    elif period == "week":
        start = now - timedelta(days=7)
    else:
        raise AdvisorValidationError("El periodo debe ser 'week' o 'month'.")

    cases = list(_case_queryset(advisor).filter(registered_at__gte=start))
    attended_cases = (
        CaseHistory.objects.filter(user=advisor, event_at__gte=start)
        .values("case_id")
        .distinct()
        .count()
    )
    closed = [
        case
        for case in cases
        if case.closed_by_id == advisor.id and case.closed_at and case.closed_at >= start
    ]
    closed_with_due = [case for case in closed if case.resolution_due_at]
    compliant = [
        case for case in closed_with_due if case.closed_at <= case.resolution_due_at
    ]
    sla_compliance = (
        round(len(compliant) * 100 / len(closed_with_due), 2)
        if closed_with_due
        else 100.0
    )
    resolution_hours = [
        (case.closed_at - case.registered_at).total_seconds() / 3600
        for case in closed
        if case.closed_at
    ]
    type_counter = Counter(case.get_case_type_display() for case in cases)
    priority_counter = Counter(case.priority.name for case in cases)

    return AdvisorPerformanceOut(
        period=period,
        assigned_cases=len(cases),
        attended_cases=attended_cases,
        closed_cases=len(closed),
        sla_compliance_percent=sla_compliance,
        average_resolution_hours=(
            round(sum(resolution_hours) / len(resolution_hours), 2)
            if resolution_hours
            else None
        ),
        by_type=[
            PerformanceBreakdownOut(label=label, total=total)
            for label, total in sorted(type_counter.items())
        ],
        by_priority=[
            PerformanceBreakdownOut(label=label, total=total)
            for label, total in sorted(priority_counter.items())
        ],
    )


def _case_queryset(advisor: UserModel):
    return (
        Case.objects.filter(responsible=advisor)
        .select_related(
            "customer",
            "service",
            "category",
            "priority",
            "status",
            "current_area",
            "closed_by",
        )
        .order_by(F("resolution_due_at").asc(nulls_last=True), "-registered_at")
    )


def _get_case(
    advisor: UserModel, case_code: str, for_update: bool = False
) -> Case:
    queryset = _case_queryset(advisor)
    if for_update:
        queryset = queryset.select_for_update()
    case = queryset.filter(code__iexact=case_code).first()
    if case is None:
        raise AdvisorCaseNotFoundError(
            "El caso no existe o no esta asignado al asesor autenticado."
        )
    return case


def _advisor_profile(advisor: UserModel) -> AdvisorProfileOut:
    words = [word for word in advisor.full_name.split() if word]
    initials = "".join(word[0].upper() for word in words[:2]) or "AS"
    sessions = advisor.auth_sessions.order_by("-created_at")
    last_session = sessions.first()
    last_access = (
        last_session.created_at.isoformat() if last_session else "Sin acceso registrado"
    )
    return AdvisorProfileOut(
        id=str(advisor.id),
        name=advisor.full_name,
        initials=initials,
        role="Asesor de Atencion",
        last_access=last_access,
    )


def _case_out(case: Case) -> AdvisorCaseOut:
    hours = _sla_hours(case)
    return AdvisorCaseOut(
        code=case.code,
        case_type=case.get_case_type_display(),
        client_type=case.customer.get_customer_type_display(),
        client_name=case.customer.display_name,
        document=f"{case.customer.document_type} {case.customer.document_number}",
        title=case.title,
        description=case.description,
        category=case.category.name,
        service=case.service.name,
        channel=case.channel,
        priority=case.priority.name,
        status=case.status.name,
        queue_status=_queue_status(case.status.name),
        area=case.current_area.name if case.current_area else None,
        sla_hours=hours,
        sla_text=_sla_text(case, hours),
        sla_group=_sla_group(case),
        registered_at=case.registered_at,
        updated_at=case.updated_at,
        resolution_due_at=case.resolution_due_at,
        pending_customer=case.pending_customer,
        action=_suggested_action(case),
    )


def _case_detail(case: Case) -> AdvisorCaseDetailOut:
    base = _case_out(case).model_dump()
    history = (
        case.history.select_related("user", "previous_status", "new_status")
        .all()
        .order_by("-event_at")
    )
    evidence = case.evidence.all().order_by("-uploaded_at")
    return AdvisorCaseDetailOut(
        **base,
        final_solution=case.final_solution,
        history=[
            CaseHistoryOut(
                id=item.id,
                action=item.action,
                summary=item.summary,
                observation=item.observation,
                previous_status=(
                    item.previous_status.name if item.previous_status else None
                ),
                new_status=item.new_status.name if item.new_status else None,
                visible_customer=item.visible_customer,
                user_name=item.user.full_name if item.user else None,
                event_at=item.event_at,
            )
            for item in history
        ],
        evidence=[
            CaseEvidenceOut(
                id=item.id,
                file_name=item.file_name,
                file_path=item.file_path,
                mime_type=item.mime_type,
                size_bytes=item.size_bytes,
                description=item.description,
                uploaded_at=item.uploaded_at,
            )
            for item in evidence
        ],
    )


def _template_out(template: ResponseTemplate) -> ResponseTemplateOut:
    return ResponseTemplateOut(
        id=template.id,
        code=template.code,
        name=template.name,
        category=template.category,
        channel=template.channel,
        description=template.description,
        body=template.body,
        active=template.active,
    )


def _notification_out(notification: AdvisorNotification) -> AdvisorNotificationOut:
    return AdvisorNotificationOut(
        id=notification.id,
        case_code=notification.case.code if notification.case else None,
        notification_type=notification.notification_type,
        channel=notification.channel,
        title=notification.title,
        message=notification.message,
        priority=notification.priority,
        read=notification.read,
        generated_at=notification.generated_at,
        read_at=notification.read_at,
    )


def _action_response(message: str, case: Case) -> AdvisorActionOut:
    case.refresh_from_db()
    return AdvisorActionOut(message=message, case=_case_detail(case))


def _get_status(name: str) -> CaseStatus:
    normalized = _normalized_status_name(name)
    status = CaseStatus.objects.filter(name__iexact=normalized, active=True).first()
    if status is None:
        raise AdvisorResourceNotFoundError("El estado solicitado no existe.")
    return status


def _normalized_status_name(name: str) -> str:
    normalized = STATUS_ALIASES.get(_plain(name))
    if normalized is None:
        raise AdvisorValidationError(f"Estado no permitido: {name}")
    return normalized


def _queue_status(status_name: str) -> str:
    return QUEUE_STATUS_BY_STATUS.get(status_name, status_name)


def _sla_hours(case: Case) -> float | None:
    if case.status.final or case.resolution_due_at is None:
        return None
    delta = case.resolution_due_at - timezone.now()
    return round(delta.total_seconds() / 3600, 1)


def _sla_text(case: Case, hours: float | None) -> str:
    if case.status.final:
        return "Finalizado"
    if hours is None:
        return "Sin SLA"
    if hours < 0:
        return f"{abs(hours):g}h vencido"
    return f"{hours:g}h restantes"


def _sla_group(case: Case) -> str:
    if case.resolution_due_at is None:
        return "semana"
    due_date = timezone.localtime(case.resolution_due_at).date()
    today = timezone.localdate()
    if due_date <= today:
        return "hoy"
    if due_date == today + timedelta(days=1):
        return "manana"
    return "semana"


def _case_sort_key(case: Case):
    hours = _sla_hours(case)
    return (hours is None, hours if hours is not None else float("inf"))


def _suggested_action(case: Case) -> str:
    queue_status = _queue_status(case.status.name)
    if queue_status == "Pendiente cliente":
        return "Revisar el plazo y la informacion pendiente del cliente."
    if queue_status == "Derivado":
        return "Dar seguimiento al area especializada."
    if queue_status == "Listo para cierre":
        return "Validar evidencia y registrar la respuesta final."
    if _sla_hours(case) is not None and _sla_hours(case) <= 8:
        return "Priorizar la atencion por riesgo de vencimiento SLA."
    return "Revisar el caso y registrar el siguiente avance."


def _create_history(
    *,
    case: Case,
    user: UserModel,
    previous_status: CaseStatus | None,
    new_status: CaseStatus | None,
    action: str,
    summary: str,
    observation: str,
    visible_customer: bool,
) -> CaseHistory:
    return CaseHistory.objects.create(
        case=case,
        user=user,
        previous_status=previous_status,
        new_status=new_status,
        action=action,
        summary=summary,
        observation=observation,
        visible_customer=visible_customer,
    )


def _notify_customer(
    case: Case,
    *,
    notification_type: str,
    channel: str,
    title: str,
    message: str,
    priority: str,
) -> None:
    if case.customer.user_id is None:
        return
    AdvisorNotification.objects.create(
        case=case,
        user=case.customer.user,
        notification_type=notification_type,
        channel=channel,
        title=title,
        message=message,
        priority=priority,
    )


def _deadline_from_text(value: str):
    match = re.search(r"\d+", value)
    if match is None:
        raise AdvisorValidationError("El plazo debe indicar una cantidad de horas.")
    hours = int(match.group())
    if hours not in {24, 48, 72}:
        raise AdvisorValidationError("El plazo permitido es 24, 48 o 72 horas.")
    return timezone.now() + timedelta(hours=hours)


def _is_customer_visible(value: str) -> bool:
    normalized = _plain(value)
    if normalized == "visible para cliente":
        return True
    if normalized == "interna":
        return False
    raise AdvisorValidationError("La visibilidad debe ser Interna o Visible para cliente.")


def _ensure_case_open(case: Case) -> None:
    if case.status.final:
        raise AdvisorValidationError("El caso ya se encuentra cerrado.")


def _require_declaration(value: bool) -> None:
    if not value:
        raise AdvisorValidationError("Debes confirmar la declaracion de la operacion.")


def _plain(value: str) -> str:
    translation = str.maketrans("áéíóúÁÉÍÓÚ", "aeiouAEIOU")
    return value.translate(translation).strip().lower()
