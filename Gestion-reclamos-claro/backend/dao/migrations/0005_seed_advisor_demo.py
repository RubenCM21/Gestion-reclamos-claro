from datetime import timedelta

from django.db import migrations
from django.utils import timezone


def seed_advisor_demo(apps, schema_editor):
    User = apps.get_model("dao", "User")
    Service = apps.get_model("dao", "Service")
    Area = apps.get_model("dao", "Area")
    Customer = apps.get_model("dao", "Customer")
    CaseCategory = apps.get_model("dao", "CaseCategory")
    CasePriority = apps.get_model("dao", "CasePriority")
    CaseStatus = apps.get_model("dao", "CaseStatus")
    Case = apps.get_model("dao", "Case")
    CaseAssignment = apps.get_model("dao", "CaseAssignment")
    CaseHistory = apps.get_model("dao", "CaseHistory")
    CaseEvidence = apps.get_model("dao", "CaseEvidence")
    AdvisorNotification = apps.get_model("dao", "AdvisorNotification")
    ResponseTemplate = apps.get_model("dao", "ResponseTemplate")

    advisor = User.objects.filter(username="asesor@demo.com").first()
    supervisor = User.objects.filter(username="supervisor@demo.com").first()
    client_person_user = User.objects.filter(
        username="cliente.persona@demo.com"
    ).first()
    client_company_user = User.objects.filter(
        username="cliente.empresa@demo.com"
    ).first()
    if advisor is None:
        return

    area_rows = [
        ("Atención al Cliente", "Atención inicial de reclamos e incidencias."),
        ("Soporte técnico", "Validación de incidencias técnicas."),
        ("Facturación", "Revisión de recibos, cargos y pagos."),
        ("Backoffice comercial", "Validación de operaciones comerciales."),
        ("Retenciones", "Gestión de solicitudes de baja y permanencia."),
    ]
    areas = {}
    for name, description in area_rows:
        areas[name], _ = Area.objects.get_or_create(
            name=name, defaults={"description": description, "active": True}
        )

    priority_rows = [
        ("Crítica", 1, 4),
        ("Alta", 2, 8),
        ("Media", 3, 24),
        ("Baja", 4, 72),
    ]
    priorities = {}
    for name, level, hours in priority_rows:
        priorities[name], _ = CasePriority.objects.get_or_create(
            name=name,
            defaults={
                "level": level,
                "target_hours": hours,
                "description": f"Prioridad {name.lower()}",
                "active": True,
            },
        )

    status_rows = [
        ("Registrado", 1, False),
        ("Pendiente de clasificación", 2, False),
        ("En atención", 3, False),
        ("Pendiente por cliente", 4, False),
        ("Escalado", 5, False),
        ("Resuelto", 6, False),
        ("Cerrado", 7, True),
    ]
    statuses = {}
    for name, order, final in status_rows:
        statuses[name], _ = CaseStatus.objects.get_or_create(
            name=name,
            defaults={
                "description": f"Estado {name.lower()}",
                "final": final,
                "visible_customer": True,
                "order": order,
                "active": True,
            },
        )

    category_rows = [
        ("RECLAMO", "Facturación"),
        ("RECLAMO", "Cobro indebido"),
        ("INCIDENCIA", "Falla de internet"),
        ("INCIDENCIA", "Sin señal móvil"),
    ]
    categories = {}
    for case_type, name in category_rows:
        categories[(case_type, name)], _ = CaseCategory.objects.get_or_create(
            case_type=case_type,
            name=name,
            defaults={
                "description": f"Categoría de {case_type.lower()}",
                "active": True,
            },
        )

    person, _ = Customer.objects.get_or_create(
        document_number="47859621",
        defaults={
            "user": client_person_user,
            "customer_type": "PERSONA",
            "first_name": "Juan Carlos",
            "last_name": "Pérez Díaz",
            "document_type": "DNI",
            "email": "cliente.persona@demo.com",
            "phone": "988222111",
            "address": "Av. Los Próceres 123, Lima",
            "active": True,
        },
    )
    company, _ = Customer.objects.get_or_create(
        document_number="20601234567",
        defaults={
            "user": client_company_user,
            "customer_type": "EMPRESA",
            "business_name": "Comercial Andina SAC",
            "document_type": "RUC",
            "email": "cliente.empresa@demo.com",
            "phone": "988333222",
            "address": "Av. Industrial 450, Lima",
            "active": True,
        },
    )

    mobile, _ = Service.objects.get_or_create(
        name="Móvil",
        defaults={"description": "Atención para líneas móviles.", "active": True},
    )
    home, _ = Service.objects.get_or_create(
        name="Hogar",
        defaults={"description": "Internet y servicios del hogar.", "active": True},
    )
    business, _ = Service.objects.get_or_create(
        name="Empresa",
        defaults={"description": "Servicios empresariales.", "active": True},
    )

    now = timezone.now()
    case_rows = [
        {
            "code": "CAS-2026-0001",
            "customer": person,
            "service": home,
            "case_type": "RECLAMO",
            "category": categories[("RECLAMO", "Cobro indebido")],
            "channel": "Portal cliente",
            "priority": priorities["Alta"],
            "status": statuses["En atención"],
            "area": areas["Facturación"],
            "title": "Cobro no reconocido en recibo mensual",
            "description": "El cliente solicita revisar un cargo observado en su recibo.",
            "registered_delta": timedelta(hours=2),
            "due_delta": timedelta(hours=6),
            "pending_customer": False,
        },
        {
            "code": "CAS-2026-0002",
            "customer": person,
            "service": home,
            "case_type": "INCIDENCIA",
            "category": categories[("INCIDENCIA", "Falla de internet")],
            "channel": "Call Center",
            "priority": priorities["Crítica"],
            "status": statuses["Pendiente por cliente"],
            "area": areas["Soporte técnico"],
            "title": "Internet hogar sin servicio",
            "description": "El cliente reporta ausencia total de navegación.",
            "registered_delta": timedelta(hours=4),
            "due_delta": timedelta(hours=2),
            "pending_customer": True,
        },
        {
            "code": "CAS-2026-0003",
            "customer": person,
            "service": mobile,
            "case_type": "INCIDENCIA",
            "category": categories[("INCIDENCIA", "Sin señal móvil")],
            "channel": "App móvil",
            "priority": priorities["Media"],
            "status": statuses["En atención"],
            "area": areas["Soporte técnico"],
            "title": "Intermitencia en servicio móvil",
            "description": "Se reportan cortes breves de datos móviles.",
            "registered_delta": timedelta(days=1),
            "due_delta": timedelta(hours=12),
            "pending_customer": False,
        },
        {
            "code": "CAS-2026-0004",
            "customer": company,
            "service": business,
            "case_type": "RECLAMO",
            "category": categories[("RECLAMO", "Facturación")],
            "channel": "Correo",
            "priority": priorities["Media"],
            "status": statuses["Resuelto"],
            "area": areas["Facturación"],
            "title": "Revisión de facturación corporativa",
            "description": "La validación está completa y pendiente de cierre.",
            "registered_delta": timedelta(days=2),
            "due_delta": timedelta(hours=24),
            "pending_customer": False,
        },
        {
            "code": "CAS-2026-0005",
            "customer": company,
            "service": business,
            "case_type": "RECLAMO",
            "category": categories[("RECLAMO", "Cobro indebido")],
            "channel": "Portal empresa",
            "priority": priorities["Alta"],
            "status": statuses["Escalado"],
            "area": areas["Backoffice comercial"],
            "title": "Validación de cargo adicional",
            "description": "El caso requiere respuesta del backoffice comercial.",
            "registered_delta": timedelta(days=3),
            "due_delta": timedelta(hours=18),
            "pending_customer": False,
        },
    ]

    cases = {}
    for row in case_rows:
        case, _ = Case.objects.update_or_create(
            code=row["code"],
            defaults={
                "customer": row["customer"],
                "service": row["service"],
                "case_type": row["case_type"],
                "category": row["category"],
                "channel": row["channel"],
                "priority": row["priority"],
                "status": row["status"],
                "current_area": row["area"],
                "responsible": advisor,
                "created_by": row["customer"].user,
                "title": row["title"],
                "description": row["description"],
                "response_due_at": now + timedelta(hours=1),
                "resolution_due_at": now + row["due_delta"],
                "pending_customer": row["pending_customer"],
            },
        )
        Case.objects.filter(pk=case.pk).update(
            registered_at=now - row["registered_delta"],
            updated_at=now - timedelta(minutes=15),
        )
        case.refresh_from_db()
        cases[row["code"]] = case

        CaseAssignment.objects.get_or_create(
            case=case,
            destination_user=advisor,
            defaults={
                "source_area": areas["Atención al Cliente"],
                "destination_area": row["area"],
                "assigned_by": supervisor,
                "movement_type": "ASIGNACION",
                "reason": "Caso asignado a la bandeja demo del asesor.",
            },
        )
        CaseHistory.objects.get_or_create(
            case=case,
            action="ASIGNACION_CASO",
            defaults={
                "user": supervisor,
                "new_status": row["status"],
                "summary": "Caso asignado",
                "observation": "El caso fue asignado al asesor para su atención.",
                "visible_customer": True,
            },
        )

    CaseEvidence.objects.get_or_create(
        case=cases["CAS-2026-0001"],
        file_name="recibo_junio_2026.pdf",
        defaults={
            "user": client_person_user,
            "file_path": "/storage/evidencias/CAS-2026-0001/recibo_junio_2026.pdf",
            "mime_type": "application/pdf",
            "size_bytes": 245120,
            "description": "Recibo observado por el cliente.",
        },
    )
    CaseEvidence.objects.get_or_create(
        case=cases["CAS-2026-0002"],
        file_name="router_estado.jpg",
        defaults={
            "user": client_person_user,
            "file_path": "/storage/evidencias/CAS-2026-0002/router_estado.jpg",
            "mime_type": "image/jpeg",
            "size_bytes": 512880,
            "description": "Imagen del estado del router.",
        },
    )

    notification_rows = [
        (
            cases["CAS-2026-0002"],
            "SLA",
            "SLA crítico próximo a vencer",
            "El caso vence en menos de dos horas y requiere actualización.",
            "critica",
        ),
        (
            cases["CAS-2026-0003"],
            "CLIENTE",
            "Cliente respondió solicitud",
            "El cliente adjuntó información para continuar la revisión.",
            "alta",
        ),
        (
            cases["CAS-2026-0001"],
            "ASIGNACION",
            "Nuevo caso asignado",
            "Se asignó un reclamo comercial a tu bandeja.",
            "alta",
        ),
        (
            cases["CAS-2026-0005"],
            "DERIVACION",
            "Derivación respondida",
            "El área responsable registró una actualización.",
            "media",
        ),
    ]
    for case, notification_type, title, message, priority in notification_rows:
        AdvisorNotification.objects.get_or_create(
            user=advisor,
            case=case,
            notification_type=notification_type,
            title=title,
            defaults={
                "channel": "SISTEMA",
                "message": message,
                "priority": priority,
                "read": False,
                "delivery_status": "GENERADO",
            },
        )

    template_rows = [
        (
            "TPL-001",
            "Solicitud de evidencia adicional",
            "evidencia",
            "Portal cliente / Correo",
            "Mensaje para solicitar sustento adicional al cliente.",
            "Estimado/a {cliente_nombre}, para continuar con el caso {codigo_caso}, "
            "necesitamos evidencia relacionada con {servicio_afectado}.",
        ),
        (
            "TPL-002",
            "Respuesta por revisión de facturación",
            "reclamo",
            "Correo",
            "Respuesta base para reclamos de facturación.",
            "Estimado/a {cliente_nombre}, revisamos el caso {codigo_caso} y "
            "detallamos el resultado sobre {servicio_afectado}.",
        ),
        (
            "TPL-003",
            "Comunicación de derivación técnica",
            "derivacion",
            "Portal cliente",
            "Mensaje para informar una derivación.",
            "Su caso {codigo_caso} fue derivado al área responsable para una "
            "validación especializada de {servicio_afectado}.",
        ),
        (
            "TPL-004",
            "Cierre con respuesta final",
            "cierre",
            "Correo / Portal",
            "Respuesta final para cerrar el caso.",
            "Se completó la revisión del caso {codigo_caso}. Se deja constancia "
            "del resultado aplicado sobre {servicio_afectado}.",
        ),
    ]
    for code, name, category, channel, description, body in template_rows:
        ResponseTemplate.objects.update_or_create(
            code=code,
            defaults={
                "name": name,
                "category": category,
                "channel": channel,
                "description": description,
                "body": body,
                "active": True,
                "created_by": advisor,
            },
        )


def remove_advisor_demo(apps, schema_editor):
    Case = apps.get_model("dao", "Case")
    Customer = apps.get_model("dao", "Customer")
    ResponseTemplate = apps.get_model("dao", "ResponseTemplate")

    Case.objects.filter(code__in=[f"CAS-2026-000{i}" for i in range(1, 6)]).delete()
    ResponseTemplate.objects.filter(code__in=[f"TPL-00{i}" for i in range(1, 5)]).delete()
    Customer.objects.filter(document_number__in=["47859621", "20601234567"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("dao", "0004_advisornotification_area_case_caseassignment_and_more"),
    ]

    operations = [
        migrations.RunPython(seed_advisor_demo, remove_advisor_demo),
    ]
