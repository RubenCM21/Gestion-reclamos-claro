from django.test import TransactionTestCase

from api.home import get_home, get_services
from dao.models import Service
from schemas.home import CustomerSegment


class HomeApiTests(TransactionTestCase):
    serialized_rollback = True

    def test_home_defaults_to_personas_and_includes_quick_services(self):
        payload = get_home(CustomerSegment.PERSONAS)

        self.assertEqual(payload.segment, "personas")
        self.assertEqual(
            payload.hero.title,
            "Gestiona tus reclamos e incidencias en tiempo real",
        )
        self.assertEqual(
            {service.code for service in payload.services},
            {"movil", "hogar", "empresa"},
        )

    def test_home_empresas_returns_business_hero(self):
        payload = get_home(CustomerSegment.EMPRESAS)

        self.assertEqual(payload.segment, "empresas")
        self.assertEqual(payload.hero.primary_text, "Solicitar atención")
        self.assertEqual(payload.hero.panel_title, "Centro empresarial inteligente")

    def test_services_can_be_filtered_by_segment(self):
        personas = get_services(CustomerSegment.PERSONAS)
        empresas = get_services(CustomerSegment.EMPRESAS)
        all_services = get_services()

        self.assertEqual(
            {service.code for service in personas},
            {"movil", "hogar"},
        )
        self.assertEqual(
            {service.code for service in empresas},
            {"empresa"},
        )
        self.assertEqual(len(all_services), 3)

    def test_invalid_segment_is_rejected(self):
        with self.assertRaises(ValueError):
            CustomerSegment("invalido")

    def test_inactive_service_is_returned_as_unavailable(self):
        Service.objects.filter(name="Móvil").update(active=False)

        services = get_services(CustomerSegment.PERSONAS)

        mobile = next(service for service in services if service.code == "movil")
        self.assertFalse(mobile.active)
        self.assertEqual(mobile.status_text, "Servicio no disponible")
