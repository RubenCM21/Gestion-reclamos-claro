from __future__ import annotations

from datetime import timedelta

from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.db.models import Count
from django.utils import timezone

from dao.models import (
    AdvisorNotification,
    Area,
    Case,
    CaseAssignment,
    CaseCategory,
    CaseEvidence,
    CaseHistory,
    CasePriority,
    CaseStatus,
    Customer,
    Service,
    UserModel,
)
from dao.models.advisor import CaseType
from dao.models.enums import UserRole
from schemas.auth import LoginRole
from schemas.portal import ActionOut, CaseCreateIn, RegisterIn, RegisterOut


class PortalNotFoundError(LookupError):
    pass


class PortalValidationError(ValueError):
    pass


ROLE_LABELS = {
    UserRole.CLIENT_PERSON: "Cliente",
    UserRole.CLIENT_COMPANY: "Cliente Empresa",
    UserRole.OPERATOR: "Asesor",
    UserRole.SUPERVISOR: "Supervisor",
    UserRole.ADMIN: "Administrador",
}


@transaction.atomic
def register_client(payload: RegisterIn) -> RegisterOut:
    role = (
        UserRole.CLIENT_COMPANY
        if payload.account_type.lower() == "empresa"
        else UserRole.CLIENT_PERSON
    )
    customer_type = "EMPRESA" if role == UserRole.CLIENT_COMPANY else "PERSONA"
    username = payload.email.lower().strip()

    if UserModel.objects.filter(username__iexact=username).exists():
        raise PortalValidationError("Ya existe una cuenta con ese correo.")
    if Customer.objects.filter(document_number=payload.document_number).exists():
        raise PortalValidationError("El documento ya se encuentra registrado.")

    full_name = _register_full_name(payload)
    user = UserModel.objects.create(
        username=username,
        full_name=full_name,
        role=role,
        hashed_password=make_password(payload.password),
    )
    Customer.objects.create(
        user=user,
        customer_type=customer_type,
        first_name=payload.first_name or None,
        last_name=payload.last_name or None,
        business_name=payload.business_name or None,
        document_type=payload.document_type,
        document_number=payload.document_number,
        email=payload.email,
        phone=payload.phone or None,
        address=payload.address or None,
        active=True,
    )

    return RegisterOut(
        username=user.username,
        role=(
            LoginRole.CLIENT_COMPANY
            if role == UserRole.CLIENT_COMPANY
            else LoginRole.CLIENT_PERSON
        ),
        message="Cuenta creada correctamente.",
    )


def verify_document(document_number: str) -> dict:
    exists = Customer.objects.filter(document_number=document_number).exists()
    return {
        "ok": not exists,
        "exists": exists,
        "message": (
            "Documento disponible para registro."
            if not exists
            else "El documento ya está registrado."
        ),
    }


def send_otp() -> dict:
    return {"ok": True, "message": "Código OTP enviado.", "demo_code": "123456"}


def fetch_client_module(user: UserModel) -> dict:
    customer = _customer_for_user(user)
    cases = list(_customer_cases(customer))
    services = _client_services(customer, cases)
    notifications = [
        _client_notification_out(item)
        for item in AdvisorNotification.objects.filter(
            user=user
        ).select_related("case")[:20]
    ]

    return {
        "user": _client_user_out(user, customer),
        "cases": [_client_case_out(item) for item in cases],
        "services": services,
        "notifications": notifications,
        "activity": [_activity_from_history(item) for item in _customer_history(customer)],
    }


def fetch_quick_case(case_code: str, document_number: str | None = None) -> dict:
    queryset = (
        Case.objects.select_related(
            "customer",
            "service",
            "category",
            "priority",
            "status",
            "responsible",
            "current_area",
        )
        .prefetch_related("history", "evidence")
        .filter(code__iexact=case_code)
    )
    if document_number:
        queryset = queryset.filter(customer__document_number=document_number)
    case = queryset.first()
    if case is None:
        raise PortalNotFoundError("No se encontró un caso con los datos indicados.")
    return _quick_case_out(case)


@transaction.atomic
def create_customer_case(
    user: UserModel, case_type: str, payload: CaseCreateIn
) -> ActionOut:
    customer = _customer_for_user(user)
    service = _service_by_name(payload.service)
    status = _status_by_name("Registrado")
    priority = _priority_by_name(payload.priority or "Media")
    category = _category_for(case_type, payload.category)
    area = Area.objects.filter(active=True).first()
    code = _next_case_code(case_type)

    case = Case.objects.create(
        code=code,
        customer=customer,
        service=service,
        case_type=case_type,
        category=category,
        channel=payload.channel,
        priority=priority,
        status=status,
        current_area=area,
        created_by=user,
        title=payload.title,
        description=payload.description,
        response_due_at=timezone.now() + timedelta(hours=2),
        resolution_due_at=timezone.now() + timedelta(hours=priority.target_hours),
    )
    CaseHistory.objects.create(
        case=case,
        user=user,
        new_status=status,
        action="REGISTRO_CLIENTE",
        summary="Caso registrado desde portal cliente",
        observation=payload.description,
        visible_customer=True,
    )
    return ActionOut(message="Caso registrado correctamente.", code=case.code)


def fetch_supervisor_module(supervisor: UserModel) -> dict:
    advisors = list(UserModel.objects.filter(role=UserRole.OPERATOR))
    cases = list(
        Case.objects.select_related(
            "customer", "service", "priority", "status", "responsible", "current_area"
        )
    )
    return {
        "supervisor": {
            "id": str(supervisor.id),
            "name": supervisor.full_name,
            "initials": _initials(supervisor.full_name),
            "role": "Supervisor de Atención",
            "status": "Supervisión activa",
            "lastUpdate": "Última actualización: ahora",
        },
        "advisors": [_advisor_out(item, cases) for item in advisors],
        "cases": [_supervisor_case_out(item) for item in cases],
        "indicators": _supervisor_indicators(cases),
        "audit": _supervisor_audit(),
        "configRules": _supervisor_config_rules(),
        "reports": _supervisor_reports(),
    }


def fetch_admin_module(admin: UserModel) -> dict:
    users = list(UserModel.objects.all())
    cases = list(Case.objects.select_related("priority", "status", "service"))
    catalogs = _catalog_items()
    return {
        "admin": {
            "id": str(admin.id),
            "name": admin.full_name,
            "initials": _initials(admin.full_name),
            "role": "Administrador del sistema",
            "status": "Sistema operativo",
            "lastUpdate": "Última actualización: ahora",
        },
        "users": [_admin_user_out(item) for item in users],
        "roles": _admin_roles(users),
        "permissions": _admin_permissions(),
        "catalogItems": catalogs,
        "slaRules": _admin_sla_rules(),
        "adminMetrics": _admin_metrics(cases),
        "reports": _supervisor_reports(),
        "integrations": _admin_integrations(),
        "webhooks": _admin_webhooks(),
        "audit": _admin_audit(),
        "backups": _admin_backups(),
        "restoreEvents": _admin_restore_events(),
        "alerts": _admin_alerts(cases),
        "systemSettings": _admin_system_settings(),
    }


def fetch_service_status(segment: str | None = None) -> dict:
    services = list(Service.objects.filter(active=True))
    if segment == "personas":
        services = [item for item in services if item.name in ["Móvil", "Hogar"]]
    elif segment == "empresas":
        services = [item for item in services if item.name == "Empresa"]
    incidents = list(Case.objects.select_related("service", "priority", "status"))
    return {
        "segment": segment or "todos",
        "services": [_status_service_out(item, incidents) for item in services],
        "incidents": [_status_incident_out(item) for item in incidents],
    }


def _register_full_name(payload: RegisterIn) -> str:
    if payload.account_type.lower() == "empresa":
        return payload.business_name or payload.representative_name or payload.email
    return " ".join(
        part for part in [payload.first_name, payload.last_name] if part
    ).strip() or payload.email


def _customer_for_user(user: UserModel) -> Customer:
    customer = Customer.objects.filter(user=user).first()
    if customer is None:
        customer = Customer.objects.first()
    if customer is None:
        raise PortalNotFoundError("No hay un cliente asociado al usuario.")
    return customer


def _customer_cases(customer: Customer):
    return (
        Case.objects.filter(customer=customer)
        .select_related(
            "customer",
            "service",
            "category",
            "priority",
            "status",
            "responsible",
            "current_area",
        )
        .order_by("-registered_at")
    )


def _customer_history(customer: Customer):
    return (
        CaseHistory.objects.filter(case__customer=customer, visible_customer=True)
        .select_related("case", "user", "new_status")
        .order_by("-event_at")[:12]
    )


def _client_user_out(user: UserModel, customer: Customer) -> dict:
    return {
        "name": customer.display_name or user.full_name,
        "initials": _initials(customer.display_name or user.full_name),
        "type": "Cliente Empresa"
        if customer.customer_type == "EMPRESA"
        else "Cliente Persona",
        "segment": "Empresas" if customer.customer_type == "EMPRESA" else "Personas",
        "document": f"{customer.document_type} {customer.document_number}",
        "email": customer.email,
        "phone": customer.phone or "Sin teléfono",
        "address": customer.address or "Sin dirección",
        "channel": "WhatsApp",
        "security": "Media",
    }


def _client_case_out(case: Case) -> dict:
    sla_hours = _sla_hours(case)
    return {
        "id": case.id,
        "code": case.code,
        "type": _case_type_label(case.case_type),
        "icon": _case_icon(case),
        "title": case.title,
        "description": case.description,
        "service": case.service.name,
        "status": case.status.name,
        "statusType": _status_type(case.status.name),
        "priority": case.priority.name,
        "priorityValue": case.priority.level,
        "date": case.registered_at.strftime("%d/%m/%Y"),
        "sla": _sla_text(case),
        "slaHours": sla_hours if sla_hours is not None else 999,
        "advisor": case.responsible.full_name if case.responsible else "Pendiente",
        "channel": case.channel,
        "action": _case_action(case),
        "progress": _case_progress(case.status.name),
    }


def _client_services(customer: Customer, cases: list[Case]) -> list[dict]:
    case_counts = {}
    for case in cases:
        case_counts[case.service_id] = case_counts.get(case.service_id, 0) + 1

    services = []
    for service in Service.objects.filter(active=True):
        count = case_counts.get(service.id, 0)
        services.append(
            {
                "id": service.id,
                "icon": _service_icon(service.name),
                "code": f"SRV-{service.id:03d}",
                "name": service.name,
                "type": service.name,
                "plan": _service_plan(service.name),
                "description": service.description or "Servicio asociado a la cuenta.",
                "status": "En observación" if count else "Activo",
                "statusType": "warning" if count else "success",
                "location": customer.address or "Lima, Perú",
                "cases": count,
                "last": "Con casos recientes" if count else "Sin casos recientes",
                "recommendation": "Revisar casos abiertos antes de crear uno nuevo."
                if count
                else "Servicio estable.",
            }
        )
    return services


def _client_notification_out(item: AdvisorNotification) -> dict:
    return {
        "id": item.id,
        "icon": "🔔",
        "title": item.title,
        "message": item.message,
        "type": item.notification_type.lower(),
        "priority": item.priority,
        "read": item.read,
        "date": item.generated_at.strftime("%d/%m/%Y %H:%M"),
        "caseCode": item.case.code if item.case else None,
    }


def _activity_from_history(item: CaseHistory) -> dict:
    return {
        "icon": "📝",
        "title": item.summary or item.action,
        "text": item.observation,
        "date": item.event_at.strftime("%d/%m/%Y %H:%M"),
    }


def _quick_case_out(case: Case) -> dict:
    history = list(case.history.select_related("user", "new_status").all())
    evidence = list(case.evidence.all())
    return {
        "code": case.code,
        "documentNumber": case.customer.document_number,
        "title": f"Caso {case.code}",
        "description": case.description,
        "type": _case_type_label(case.case_type),
        "service": case.service.name,
        "priority": case.priority.name,
        "status": case.status.name,
        "statusType": _status_type(case.status.name),
        "lastUpdate": case.updated_at.strftime("%d/%m/%Y %H:%M"),
        "responsible": case.current_area.name if case.current_area else "Mesa de entrada",
        "sla": _sla_text(case),
        "risk": _risk(case),
        "riskText": _risk_text(case),
        "recommendation": _case_action(case),
        "tracker": [item.new_status.name for item in history if item.new_status]
        or ["Registrado"],
        "timeline": [
            {
                "icon": "📝",
                "title": item.summary or item.action,
                "description": item.observation,
                "date": item.event_at.strftime("%d/%m/%Y %H:%M"),
            }
            for item in history
        ],
        "evidences": [
            {
                "icon": "📄",
                "name": item.file_name,
                "detail": f"Subido · {item.uploaded_at.strftime('%d/%m/%Y')}",
            }
            for item in evidence
        ],
    }


def _advisor_out(user: UserModel, cases: list[Case]) -> dict:
    assigned = [case for case in cases if case.responsible_id == user.id]
    critical = [case for case in assigned if case.priority.name == "Crítica"]
    risk = [case for case in assigned if (_sla_hours(case) or 999) <= 8]
    capacity = min(100, len(assigned) * 8)
    return {
        "id": str(user.id),
        "name": user.full_name,
        "initials": _initials(user.full_name),
        "specialty": "Atención al cliente",
        "status": "Disponible" if capacity < 85 else "Ocupado",
        "cases": len(assigned),
        "critical": len(critical),
        "slaRisk": len(risk),
        "productivity": max(70, 98 - len(risk) * 4),
        "capacity": capacity,
    }


def _supervisor_case_out(case: Case) -> dict:
    sla_hours = _sla_hours(case)
    return {
        "id": case.code,
        "icon": _case_icon(case),
        "type": _case_type_label(case.case_type),
        "clientName": case.customer.display_name,
        "clientType": "Empresa" if case.customer.customer_type == "EMPRESA" else "Persona",
        "channel": case.channel,
        "service": case.service.name,
        "title": case.title,
        "description": case.description,
        "status": _supervisor_status(case),
        "classificationStatus": "Clasificado"
        if case.category_id
        else "Sin clasificar",
        "assignmentStatus": "Asignado" if case.responsible_id else "Sin asesor",
        "assignmentFlow": "Asignado" if case.responsible_id else "Pendiente asignación",
        "advisorId": str(case.responsible_id) if case.responsible_id else None,
        "advisorName": case.responsible.full_name if case.responsible else "Sin asignar",
        "area": case.current_area.name if case.current_area else "Mesa de entrada",
        "priority": case.priority.name,
        "slaHours": sla_hours if sla_hours is not None else 999,
        "slaText": _sla_text(case),
        "slaRisk": _sla_risk_label(case),
        "slaGroup": _sla_group(case),
        "riskType": "riesgo_alto" if (sla_hours or 999) <= 8 else "controlado",
        "pendingType": "sin_asignar" if not case.responsible_id else "asignados",
        "blocked": case.pending_customer,
        "escalated": case.status.name == "Escalado",
        "derived": case.status.name == "Escalado",
        "observed": case.pending_customer,
        "createdAt": case.registered_at.strftime("%d/%m/%Y %H:%M"),
        "updatedAt": case.updated_at.strftime("%d/%m/%Y %H:%M"),
        "action": _case_action(case),
        "reason": case.description,
    }


def _admin_user_out(user: UserModel) -> dict:
    role = ROLE_LABELS.get(user.role, user.role)
    return {
        "id": str(user.id),
        "initials": _initials(user.full_name),
        "name": user.full_name,
        "email": user.username,
        "role": role,
        "area": _role_area(user.role),
        "status": "Activo",
        "accessType": "Acceso administrativo" if user.role == UserRole.ADMIN else "Acceso estándar",
        "lastAccess": "Sesión reciente",
        "createdAt": user.created_at.strftime("%d/%m/%Y"),
        "risk": "Alto" if user.role == UserRole.ADMIN else "Medio",
        "activity": user.notifications.count() if hasattr(user, "notifications") else 0,
    }


def _admin_roles(users: list[UserModel]) -> list[dict]:
    counts = {role: 0 for role in ROLE_LABELS}
    for user in users:
        counts[user.role] = counts.get(user.role, 0) + 1
    rows = [
        (UserRole.CLIENT_PERSON, "👤", "Cliente", "Cliente", "Básico"),
        (UserRole.CLIENT_COMPANY, "🏢", "Cliente Empresa", "Cliente", "Básico"),
        (UserRole.OPERATOR, "🎧", "Asesor", "Atención", "Operativo"),
        (UserRole.SUPERVISOR, "🧭", "Supervisor", "Supervisión", "Supervisor"),
        (UserRole.ADMIN, "🔐", "Administrador", "Administración", "Administrador"),
    ]
    return [
        {
            "id": f"ROL-{index:03d}",
            "icon": icon,
            "name": name,
            "scope": scope,
            "accessLevel": level,
            "status": "Activo",
            "users": counts.get(role, 0),
            "description": f"Permisos del perfil {name}.",
        }
        for index, (role, icon, name, scope, level) in enumerate(rows, start=1)
    ]


def _admin_permissions() -> list[dict]:
    modules = ["Casos", "Usuarios", "Catálogos", "SLA", "Reportes", "Auditoría"]
    return [
        {
            "id": f"PER-{index:03d}",
            "module": module,
            "name": f"Gestionar {module.lower()}",
            "description": f"Permite consultar y administrar {module.lower()}.",
            "risk": "Alto" if module in ["Usuarios", "Auditoría"] else "Medio",
            "roles": ["Administrador", "Supervisor"]
            if module != "Usuarios"
            else ["Administrador"],
            "status": "Activo",
        }
        for index, module in enumerate(modules, start=1)
    ]


def _catalog_items() -> list[dict]:
    items = []
    for model, type_label, filter_type in [
        (Service, "Servicio", "servicios"),
        (Area, "Área", "areas"),
        (CasePriority, "Prioridad", "prioridades"),
        (CaseStatus, "Estado", "estados"),
        (CaseCategory, "Categoría", "categorias"),
    ]:
        for item in model.objects.all():
            items.append(
                {
                    "id": f"{filter_type.upper()}-{item.id}",
                    "name": item.name,
                    "type": type_label,
                    "filterType": filter_type,
                    "description": getattr(item, "description", None) or "Catálogo operativo.",
                    "status": "Activo" if getattr(item, "active", True) else "Inactivo",
                    "items": Case.objects.filter(category_id=item.id).count()
                    if isinstance(item, CaseCategory)
                    else 0,
                    "updatedAt": "Actualizado",
                }
            )
    return items


def _admin_sla_rules() -> list[dict]:
    return [
        {
            "id": f"SLA-{priority.id:03d}",
            "name": f"SLA prioridad {priority.name}",
            "type": priority.name,
            "service": "Todos",
            "priority": priority.name,
            "firstResponse": max(1, priority.target_hours // 4),
            "resolution": priority.target_hours,
            "status": "Activo" if priority.active else "Inactivo",
            "escalation": "Supervisor",
        }
        for priority in CasePriority.objects.all()
    ]


def _admin_metrics(cases: list[Case]) -> list[dict]:
    open_cases = [case for case in cases if not case.status.final]
    closed_cases = [case for case in cases if case.status.final]
    return [
        {"id": "MET-001", "name": "Casos abiertos", "value": len(open_cases), "unit": "casos", "status": "warning"},
        {"id": "MET-002", "name": "Casos cerrados", "value": len(closed_cases), "unit": "casos", "status": "success"},
        {"id": "MET-003", "name": "Riesgo SLA", "value": len([c for c in open_cases if (_sla_hours(c) or 999) <= 8]), "unit": "casos", "status": "danger"},
    ]


def _supervisor_indicators(cases: list[Case]) -> list[dict]:
    return [
        {"id": "IND-001", "name": "Casos pendientes", "value": len([c for c in cases if not c.status.final]), "target": 10, "status": "warning"},
        {"id": "IND-002", "name": "Casos críticos", "value": len([c for c in cases if c.priority.name == "Crítica"]), "target": 3, "status": "danger"},
        {"id": "IND-003", "name": "Casos cerrados", "value": len([c for c in cases if c.status.final]), "target": 20, "status": "success"},
    ]


def _supervisor_audit() -> list[dict]:
    return [
        {"id": "AUD-001", "caseId": "CAS-2026-0001", "type": "asignacion", "user": "Sistema", "action": "Caso asignado", "date": "Reciente", "critical": False},
        {"id": "AUD-002", "caseId": "CAS-2026-0002", "type": "sla", "user": "Sistema", "action": "Alerta SLA", "date": "Reciente", "critical": True},
    ]


def _supervisor_config_rules() -> list[dict]:
    return [
        {"id": "RUT-001", "route": "Incidencia técnica", "condition": "Servicio afectado", "area": "Soporte técnico", "internalSla": "8 horas", "escalation": "Supervisor", "status": "Activo"},
        {"id": "RUT-002", "route": "Reclamo de facturación", "condition": "Cargo observado", "area": "Facturación", "internalSla": "24 horas", "escalation": "Backoffice", "status": "Activo"},
    ]


def _supervisor_reports() -> list[dict]:
    return [
        {"id": "REP-001", "name": "Reporte operativo diario", "type": "PDF", "status": "Generado", "date": "Hoy"},
        {"id": "REP-002", "name": "Indicadores SLA", "type": "EXCEL", "status": "Programado", "date": "Semanal"},
    ]


def _admin_integrations() -> list[dict]:
    return [
        {"id": "INT-001", "name": "Correo transaccional", "type": "Email", "status": "Activo", "lastSync": "Hoy", "owner": "Sistema"},
        {"id": "INT-002", "name": "SMS/WhatsApp", "type": "Mensajería", "status": "Activo", "lastSync": "Hoy", "owner": "Sistema"},
    ]


def _admin_webhooks() -> list[dict]:
    return [
        {"icon": "🔔", "title": "Evento de notificación", "text": "Webhook enviado correctamente.", "date": "Reciente"},
        {"icon": "🔁", "title": "Sincronización", "text": "Catálogos sincronizados.", "date": "Reciente"},
    ]


def _admin_audit() -> list[dict]:
    return [
        {"id": "AUD-ADM-001", "module": "Usuarios", "type": "seguridad", "user": "Administrador", "action": "Consulta de usuarios", "date": "Reciente", "critical": False},
        {"id": "AUD-ADM-002", "module": "SLA", "type": "configuracion", "user": "Sistema", "action": "Reglas revisadas", "date": "Reciente", "critical": False},
    ]


def _admin_backups() -> list[dict]:
    return [
        {"id": "BKP-001", "name": "Respaldo diario", "type": "Completo", "status": "Verificado", "size": "128 MB", "date": "Hoy"},
        {"id": "BKP-002", "name": "Respaldo semanal", "type": "Completo", "status": "Programado", "size": "Pendiente", "date": "Semanal"},
    ]


def _admin_restore_events() -> list[dict]:
    return [
        {"icon": "🧪", "title": "Prueba de restauración", "text": "Validación completada.", "date": "Reciente"},
        {"icon": "💾", "title": "Copia verificada", "text": "Respaldo disponible.", "date": "Hoy"},
    ]


def _admin_alerts(cases: list[Case]) -> list[dict]:
    return [
        {"id": "ALT-001", "title": "Casos en riesgo SLA", "type": "sla", "priority": "Alta", "status": "Activo", "total": len([c for c in cases if (_sla_hours(c) or 999) <= 8])},
    ]


def _admin_system_settings() -> list[dict]:
    return [
        {"id": "CFG-001", "name": "Retención de sesiones", "value": "24 horas", "status": "Activo"},
        {"id": "CFG-002", "name": "Notificaciones", "value": "Sistema y email", "status": "Activo"},
    ]


def _status_service_out(service: Service, cases: list[Case]) -> dict:
    service_cases = [case for case in cases if case.service_id == service.id and not case.status.final]
    return {
        "id": service.id,
        "name": service.name,
        "segment": "empresas" if service.name == "Empresa" else "personas",
        "status": "En observación" if service_cases else "Operativo",
        "statusType": "warning" if service_cases else "success",
        "availability": 99.2 if service_cases else 99.9,
        "incidents": len(service_cases),
        "description": service.description or "Servicio monitoreado.",
    }


def _status_incident_out(case: Case) -> dict:
    return {
        "code": case.code,
        "segment": "empresas" if case.customer.customer_type == "EMPRESA" else "personas",
        "type": "incidencia" if case.case_type == CaseType.INCIDENT else "reclamo",
        "service": case.service.name,
        "status": case.status.name,
        "priority": case.priority.name,
        "location": case.customer.address or "Lima, Perú",
        "updatedAt": case.updated_at.strftime("%d/%m/%Y %H:%M"),
        "description": case.description,
    }


def _case_type_label(value: str) -> str:
    return "Incidencia" if value == CaseType.INCIDENT else "Reclamo"


def _case_icon(case: Case) -> str:
    if case.priority.name == "Crítica":
        return "🔥"
    return "⚠️" if case.case_type == CaseType.INCIDENT else "📝"


def _service_icon(name: str) -> str:
    return {"Móvil": "📱", "Hogar": "🏠", "Empresa": "🏢"}.get(name, "📡")


def _service_plan(name: str) -> str:
    return {"Móvil": "Max Ilimitado", "Hogar": "Fibra Hogar", "Empresa": "Conectividad Pyme"}.get(name, "Plan activo")


def _status_type(status: str) -> str:
    plain = status.lower()
    if "cerrado" in plain or "resuelto" in plain:
        return "success"
    if "pendiente" in plain or "registrado" in plain:
        return "warning"
    if "escalado" in plain:
        return "danger"
    return "info"


def _supervisor_status(case: Case) -> str:
    if case.status.name == "Registrado":
        return "Nuevo"
    if case.status.name == "Pendiente de clasificación":
        return "Pendiente clasificación"
    return case.status.name


def _case_progress(status: str) -> int:
    return {
        "Registrado": 20,
        "Pendiente de clasificación": 30,
        "En atención": 60,
        "Pendiente por cliente": 50,
        "Escalado": 70,
        "Resuelto": 90,
        "Cerrado": 100,
    }.get(status, 40)


def _case_action(case: Case) -> str:
    if case.pending_customer:
        return "Responder solicitud del asesor"
    if case.status.final:
        return "Caso cerrado"
    if case.status.name == "Resuelto":
        return "Revisar respuesta final"
    return "Esperar revisión del asesor"


def _sla_hours(case: Case) -> float | None:
    if case.resolution_due_at is None or case.status.final:
        return None
    delta = case.resolution_due_at - timezone.now()
    return round(delta.total_seconds() / 3600, 1)


def _sla_text(case: Case) -> str:
    hours = _sla_hours(case)
    if hours is None:
        return "Cerrado" if case.status.final else "Sin SLA"
    if hours < 0:
        return f"Vencido hace {abs(hours):.1f}h"
    return f"{hours:.1f}h restantes"


def _sla_risk_label(case: Case) -> str:
    hours = _sla_hours(case)
    if hours is None:
        return "Controlado"
    if hours <= 4:
        return "Riesgo alto"
    if hours <= 12:
        return "Riesgo medio"
    return "Controlado"


def _sla_group(case: Case) -> str:
    hours = _sla_hours(case)
    if hours is None:
        return "cerrado"
    if hours <= 8:
        return "vence_hoy"
    if hours <= 72:
        return "semana"
    return "controlado"


def _risk(case: Case) -> int:
    hours = _sla_hours(case)
    if hours is None:
        return 10
    if hours <= 4:
        return 85
    if hours <= 12:
        return 60
    return 25


def _risk_text(case: Case) -> str:
    risk = _risk(case)
    if risk >= 80:
        return "Riesgo alto. El caso requiere atención prioritaria."
    if risk >= 50:
        return "Riesgo medio. El caso aún se encuentra dentro del plazo."
    return "Riesgo controlado."


def _role_area(role: str) -> str:
    return {
        UserRole.ADMIN: "Administración",
        UserRole.SUPERVISOR: "Supervisión",
        UserRole.OPERATOR: "Atención al cliente",
        UserRole.CLIENT_COMPANY: "Portal empresa",
        UserRole.CLIENT_PERSON: "Portal cliente",
    }.get(role, "Portal")


def _service_by_name(name: str) -> Service:
    service = Service.objects.filter(name__iexact=name).first() or Service.objects.first()
    if service is None:
        raise PortalValidationError("No hay servicios disponibles.")
    return service


def _status_by_name(name: str) -> CaseStatus:
    status = CaseStatus.objects.filter(name__iexact=name).first()
    if status is None:
        raise PortalValidationError(f"No existe el estado {name}.")
    return status


def _priority_by_name(name: str) -> CasePriority:
    priority = CasePriority.objects.filter(name__iexact=name).first()
    if priority is None:
        priority = CasePriority.objects.order_by("level").first()
    if priority is None:
        raise PortalValidationError("No hay prioridades configuradas.")
    return priority


def _category_for(case_type: str, name: str | None) -> CaseCategory:
    queryset = CaseCategory.objects.filter(case_type=case_type)
    category = queryset.filter(name__iexact=name).first() if name else queryset.first()
    if category is None:
        category = CaseCategory.objects.create(
            case_type=case_type,
            name=name or ("Falla de internet" if case_type == CaseType.INCIDENT else "Facturación"),
            description="Categoría generada por registro de cliente.",
            active=True,
        )
    return category


def _next_case_code(case_type: str) -> str:
    prefix = "INC" if case_type == CaseType.INCIDENT else "REC"
    year = timezone.now().year
    total = Case.objects.filter(code__startswith=f"{prefix}-{year}").count() + 1
    return f"{prefix}-{year}-{total:06d}"


def _initials(name: str) -> str:
    parts = [part[0] for part in str(name).split() if part]
    return "".join(parts[:2]).upper() or "US"
