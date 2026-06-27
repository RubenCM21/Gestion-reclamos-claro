from django.test import TransactionTestCase
from django.utils import timezone
from fastapi import HTTPException

from api import advisor as advisor_api
from api.dependencies import require_advisor
from dao.models import (
    AdvisorNotification,
    AuthSession,
    Case,
    CaseAssignment,
    CaseCommunication,
    CaseHistory,
    ResponseTemplate,
    UserModel,
)
from schemas.advisor import (
    CaseCloseIn,
    CaseDeriveIn,
    CaseUpdateIn,
    CustomerInformationRequestIn,
    ResponseTemplateCreateIn,
    TemplateSendIn,
)


class AdvisorApiTests(TransactionTestCase):
    serialized_rollback = True

    def setUp(self):
        self.advisor = UserModel.objects.get(username="asesor@demo.com")

    def test_advisor_routes_require_authentication_and_role(self):
        with self.assertRaises(HTTPException) as anonymous:
            require_advisor()

        self.assertEqual(anonymous.exception.status_code, 401)

        client_user = UserModel.objects.get(username="cliente.persona@demo.com")
        client_session = AuthSession.objects.create(
            user=client_user,
            token="cliente-persona-test-token",
            expires_at=timezone.now() + timezone.timedelta(hours=1),
        )

        with self.assertRaises(HTTPException) as forbidden:
            require_advisor(f"Bearer {client_session.token}")

        self.assertEqual(forbidden.exception.status_code, 403)

    def test_dashboard_cases_and_detail_use_seeded_data(self):
        dashboard = advisor_api.get_dashboard(self.advisor)
        self.assertEqual(dashboard.advisor.name, "Asesor de Atención")
        self.assertEqual(
            next(item.value for item in dashboard.kpis if item.key == "assigned"),
            5,
        )

        cases = advisor_api.get_cases(
            self.advisor,
            search=None,
            priority="Alta",
            case_status=None,
            queue_status=None,
            sla_risk=False,
        )
        self.assertEqual(cases.total, 2)

        detail = advisor_api.get_case("CAS-2026-0001", self.advisor)
        self.assertEqual(detail.client_name, "Juan Carlos Pérez Díaz")
        self.assertEqual(len(detail.evidence), 1)

    def test_update_request_derive_and_close_create_traceability(self):
        update = advisor_api.update_case(
            "CAS-2026-0003",
            self.advisor,
            CaseUpdateIn(
                status="Pendiente por cliente",
                visibility="Visible para cliente",
                summary="Se requiere validación adicional",
                detail="Se revisó el caso y falta una captura de señal.",
                declaration=True,
            ),
        )
        self.assertEqual(update.case.status, "Pendiente por cliente")

        request = advisor_api.request_customer_information(
            "CAS-2026-0001",
            self.advisor,
            CustomerInformationRequestIn(
                channel="Correo",
                deadline="24 horas",
                subject="Solicitud de recibo detallado",
                message="Adjunte el recibo detallado para continuar la revisión.",
                declaration=True,
            ),
        )
        self.assertTrue(request.case.pending_customer)
        self.assertTrue(
            CaseCommunication.objects.filter(
                case__code="CAS-2026-0001",
                communication_type="SOLICITUD_INFORMACION",
            ).exists()
        )

        derive = advisor_api.derive_case(
            "CAS-2026-0002",
            self.advisor,
            CaseDeriveIn(
                area="Facturación",
                priority="Alta",
                reason="Se identificó un posible bloqueo administrativo.",
            ),
        )
        self.assertEqual(derive.case.status, "Escalado")
        self.assertTrue(
            CaseAssignment.objects.filter(
                case__code="CAS-2026-0002", movement_type="DERIVACION"
            ).exists()
        )

        close = advisor_api.close_case(
            "CAS-2026-0004",
            self.advisor,
            CaseCloseIn(
                response=(
                    "Se validó la facturación y se aplicó el ajuste "
                    "correspondiente."
                ),
                declaration=True,
            ),
        )
        self.assertEqual(close.case.status, "Cerrado")
        self.assertTrue(Case.objects.get(code="CAS-2026-0004").status.final)
        self.assertTrue(
            CaseHistory.objects.filter(
                case__code="CAS-2026-0004", action="CIERRE_CASO"
            ).exists()
        )

    def test_templates_notifications_and_performance(self):
        created = advisor_api.create_template(
            self.advisor,
            ResponseTemplateCreateIn(
                name="Solicitud técnica",
                category="evidencia",
                channel="Correo",
                description="Solicita evidencia técnica.",
                body="Estimado cliente, adjunte evidencia técnica para continuar.",
                declaration=True,
            ),
        )
        self.assertTrue(ResponseTemplate.objects.filter(id=created.id).exists())

        sent = advisor_api.send_template(
            created.id,
            self.advisor,
            TemplateSendIn(
                case_code="CAS-2026-0001",
                channel="Correo",
                message=(
                    "Estimado cliente, adjunte evidencia técnica para continuar."
                ),
                declaration=True,
            ),
        )
        self.assertTrue(sent.ok)

        notifications = advisor_api.get_notifications(
            self.advisor,
            search=None,
            notification_type=None,
            priority=None,
            unread_only=False,
        )
        self.assertGreater(notifications.unread, 0)

        marked = advisor_api.mark_all_notifications_read(self.advisor)
        self.assertTrue(marked.ok)
        self.assertFalse(
            AdvisorNotification.objects.filter(
                user__username="asesor@demo.com", read=False
            ).exists()
        )

        performance = advisor_api.get_performance(self.advisor, period="week")
        self.assertEqual(performance.assigned_cases, 5)
