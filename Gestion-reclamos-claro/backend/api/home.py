from fastapi import APIRouter, Query

from business_logic.home import fetch_home, fetch_services
from schemas.home import CustomerSegment, HomeOut, HomeServiceOut


router = APIRouter()


@router.get("/home", response_model=HomeOut)
def get_home(
    segment: CustomerSegment = Query(
        CustomerSegment.PERSONAS,
        description="Vista de atención para personas o empresas",
    ),
):
    return fetch_home(segment)


@router.get("/services", response_model=list[HomeServiceOut])
def get_services(
    segment: CustomerSegment | None = Query(
        None,
        description="Filtro opcional por personas o empresas",
    ),
):
    return fetch_services(segment)
