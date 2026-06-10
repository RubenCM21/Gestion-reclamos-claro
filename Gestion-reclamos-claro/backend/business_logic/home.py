from dao.models import Service
from schemas.home import (
    CustomerSegment,
    HomeActionOut,
    HomeHeroOut,
    HomeOut,
    HomeServiceOut,
    ServiceCode,
)


HERO_BY_SEGMENT = {
    CustomerSegment.PERSONAS: HomeHeroOut(
        eyebrow="Personas | Atención inteligente",
        title="Gestiona tus reclamos e incidencias en tiempo real",
        description=(
            "Registra, consulta y haz seguimiento de tus casos desde una plataforma "
            "moderna, rápida y transparente, con asistencia inteligente en cada paso."
        ),
        primary_text="Registrar reclamo",
        primary_href="cliente/registrar-reclamo.html",
        panel_title="Centro de atención rápida",
        status_text="Atención disponible",
    ),
    CustomerSegment.EMPRESAS: HomeHeroOut(
        eyebrow="Empresas | Soluciones digitales",
        title="Potencia tu empresa con atención y soporte inteligente",
        description=(
            "Gestiona incidencias empresariales, servicios cloud, conectividad, "
            "seguridad y soporte con trazabilidad completa y control de SLA."
        ),
        primary_text="Solicitar atención",
        primary_href="cliente/registrar-incidencia.html",
        panel_title="Centro empresarial inteligente",
        status_text="Mesa empresarial activa",
    ),
}

SERVICE_CONFIG = {
    "Móvil": {
        "code": ServiceCode.MOBILE,
        "status_text": "Red móvil monitoreada",
        "actions": [
            ("registrar-reclamo", "Registrar reclamo móvil", "cliente/registrar-reclamo.html"),
            (
                "registrar-incidencia",
                "Reportar incidencia móvil",
                "cliente/registrar-incidencia.html",
            ),
            ("consultar-caso", "Consultar caso móvil", "consulta-rapida.html"),
            ("centro-ayuda", "Ayuda para mi línea", "centro-ayuda.html"),
        ],
    },
    "Hogar": {
        "code": ServiceCode.HOME,
        "status_text": "Soporte hogar disponible",
        "actions": [
            ("registrar-reclamo", "Registrar reclamo hogar", "cliente/registrar-reclamo.html"),
            (
                "registrar-incidencia",
                "Reportar falla de internet",
                "cliente/registrar-incidencia.html",
            ),
            ("consultar-caso", "Consultar estado de caso", "consulta-rapida.html"),
            ("centro-ayuda", "Ayuda para internet/TV", "centro-ayuda.html"),
        ],
    },
    "Empresa": {
        "code": ServiceCode.BUSINESS,
        "status_text": "Mesa empresarial activa",
        "actions": [
            (
                "registrar-incidencia",
                "Reportar incidencia empresarial",
                "cliente/registrar-incidencia.html",
            ),
            ("consultar-caso", "Consultar ticket empresarial", "consulta-rapida.html"),
            ("centro-ayuda", "Mesa de ayuda empresarial", "centro-ayuda.html"),
            (
                "registrar-reclamo",
                "Registrar reclamo corporativo",
                "cliente/registrar-reclamo.html",
            ),
        ],
    },
}


def fetch_home(segment: CustomerSegment) -> HomeOut:
    return HomeOut(
        segment=segment,
        hero=HERO_BY_SEGMENT[segment],
        services=fetch_services(),
    )


def fetch_services(segment: CustomerSegment | None = None) -> list[HomeServiceOut]:
    services = Service.objects.filter(name__in=SERVICE_CONFIG)

    if segment == CustomerSegment.EMPRESAS:
        services = services.filter(name="Empresa")
    elif segment == CustomerSegment.PERSONAS:
        services = services.filter(name__in=["Móvil", "Hogar"])

    return [_to_service_out(service) for service in services]


def _to_service_out(service: Service) -> HomeServiceOut:
    config = SERVICE_CONFIG[service.name]
    actions = [
        HomeActionOut(code=code, label=label, href=href)
        for code, label, href in config["actions"]
    ]

    return HomeServiceOut(
        id=service.id,
        code=config["code"],
        name=service.name,
        description=service.description,
        active=service.active,
        status_text=config["status_text"] if service.active else "Servicio no disponible",
        actions=actions,
    )
