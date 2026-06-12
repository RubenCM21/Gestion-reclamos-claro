from django.test import TransactionTestCase
from fastapi.testclient import TestClient

from dao.models import (
    AdvisorNotification,
    Case,
    CaseAssignment,
    CaseCommunication,
    CaseHistory,
    ResponseTemplate,
)
from main import app


class AdvisorApiTests(TransactionTestCase):
    serialized_rollback = True

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.api_client = TestClient(app)

    def setUp(self):
        login = self.api_client.post(
            "/api/auth/login",
            json={
                "username": "asesor@demo.com",
                "password": "1234",
                "role": "asesor",
                "remember_me": False,
            },
        )
        self.assertEqual(login.status_code, 200)
        self.headers = {"Authorization": f"Bearer {login.json()['token']}"}

    def test_advisor_routes_require_authentication_and_role(self):
        anonymous = self.api_client.get("/api/advisor/dashboard")
        self.assertEqual(anonymous.status_code, 401)

        client_login = self.api_client.post(
            "/api/auth/login",
            json={
                "username": "cliente.persona@demo.com",
                "password": "1234",
                "role": "cliente-persona",
                "remember_me": False,
            },
        )
        response = self.api_client.get(
            "/api/advisor/dashboard",
            headers={
                "Authorization": f"Bearer {client_login.json()['token']}"
            },
        )
        self.assertEqual(response.status_code, 403)

    def test_dashboard_cases_and_detail_use_seeded_data(self):
        dashboard = self.api_client.get(
            "/api/advisor/dashboard", headers=self.headers
        )
        self.assertEqual(dashboard.status_code, 200)
        self.assertEqual(dashboard.json()["advisor"]["name"], "Asesor de Atención")
        self.assertEqual(
            next(
                item["value"]
                for item in dashboard.json()["kpis"]
                if item["key"] == "assigned"
            ),
            5,
        )

        cases = self.api_client.get(
            "/api/advisor/cases?priority=Alta", headers=self.headers
        )
        self.assertEqual(cases.status_code, 200)
        self.assertEqual(cases.json()["total"], 2)

        detail = self.api_client.get(
            "/api/advisor/cases/CAS-2026-0001", headers=self.headers
        )
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.json()["client_name"], "Juan Carlos Pérez Díaz")
        self.assertEqual(len(detail.json()["evidence"]), 1)

    def test_update_request_derive_and_close_create_traceability(self):
        update = self.api_client.post(
            "/api/advisor/cases/CAS-2026-0003/updates",
            headers=self.headers,
            json={
                "status": "Pendiente por cliente",
                "visibility": "Visible para cliente",
                "summary": "Se requiere validación adicional",
                "detail": "Se revisó el caso y falta una captura de señal.",
                "declaration": True,
            },
        )
        self.assertEqual(update.status_code, 200)
        self.assertEqual(update.json()["case"]["status"], "Pendiente por cliente")

        request = self.api_client.post(
            "/api/advisor/cases/CAS-2026-0001/information-requests",
            headers=self.headers,
            json={
                "channel": "Correo",
                "deadline": "24 horas",
                "subject": "Solicitud de recibo detallado",
                "message": "Adjunte el recibo detallado para continuar la revisión.",
                "declaration": True,
            },
        )
        self.assertEqual(request.status_code, 200)
        self.assertTrue(request.json()["case"]["pending_customer"])
        self.assertTrue(
            CaseCommunication.objects.filter(
                case__code="CAS-2026-0001",
                communication_type="SOLICITUD_INFORMACION",
            ).exists()
        )

        derive = self.api_client.post(
            "/api/advisor/cases/CAS-2026-0002/derive",
            headers=self.headers,
            json={
                "area": "Facturación",
                "priority": "Alta",
                "reason": "Se identificó un posible bloqueo administrativo.",
            },
        )
        self.assertEqual(derive.status_code, 200)
        self.assertEqual(derive.json()["case"]["status"], "Escalado")
        self.assertTrue(
            CaseAssignment.objects.filter(
                case__code="CAS-2026-0002", movement_type="DERIVACION"
            ).exists()
        )

        close = self.api_client.post(
            "/api/advisor/cases/CAS-2026-0004/close",
            headers=self.headers,
            json={
                "response": "Se validó la facturación y se aplicó el ajuste correspondiente.",
                "declaration": True,
            },
        )
        self.assertEqual(close.status_code, 200)
        self.assertEqual(close.json()["case"]["status"], "Cerrado")
        self.assertTrue(Case.objects.get(code="CAS-2026-0004").status.final)
        self.assertTrue(
            CaseHistory.objects.filter(
                case__code="CAS-2026-0004", action="CIERRE_CASO"
            ).exists()
        )

    def test_templates_notifications_and_performance(self):
        created = self.api_client.post(
            "/api/advisor/templates",
            headers=self.headers,
            json={
                "name": "Solicitud técnica",
                "category": "evidencia",
                "channel": "Correo",
                "description": "Solicita evidencia técnica.",
                "body": "Estimado cliente, adjunte evidencia técnica para continuar.",
                "declaration": True,
            },
        )
        self.assertEqual(created.status_code, 201)
        template_id = created.json()["id"]
        self.assertTrue(ResponseTemplate.objects.filter(id=template_id).exists())

        sent = self.api_client.post(
            f"/api/advisor/templates/{template_id}/send",
            headers=self.headers,
            json={
                "case_code": "CAS-2026-0001",
                "channel": "Correo",
                "message": "Estimado cliente, adjunte evidencia técnica para continuar.",
                "declaration": True,
            },
        )
        self.assertEqual(sent.status_code, 200)

        notifications = self.api_client.get(
            "/api/advisor/notifications", headers=self.headers
        )
        self.assertEqual(notifications.status_code, 200)
        self.assertGreater(notifications.json()["unread"], 0)

        marked = self.api_client.post(
            "/api/advisor/notifications/read-all", headers=self.headers
        )
        self.assertEqual(marked.status_code, 200)
        self.assertFalse(
            AdvisorNotification.objects.filter(
                user__username="asesor@demo.com", read=False
            ).exists()
        )

        performance = self.api_client.get(
            "/api/advisor/performance?period=week", headers=self.headers
        )
        self.assertEqual(performance.status_code, 200)
        self.assertEqual(performance.json()["assigned_cases"], 5)
