from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status

from api.dependencies import require_admin, require_client, require_supervisor
from business_logic import portal as portal_controller
from business_logic.portal import PortalNotFoundError, PortalValidationError
from dao.models import UserModel
from dao.models.advisor import CaseType
from schemas.portal import ActionOut, CaseCreateIn, RegisterIn, RegisterOut


router = APIRouter()
ClientUser = Annotated[UserModel, Depends(require_client)]
SupervisorUser = Annotated[UserModel, Depends(require_supervisor)]
AdminUser = Annotated[UserModel, Depends(require_admin)]


@router.post("/auth/register", response_model=RegisterOut, tags=["auth"])
def register_client(payload: RegisterIn = Body(...)):
    return _execute(lambda: portal_controller.register_client(payload))


@router.get("/auth/register/verify-document", tags=["auth"])
def verify_document(document_number: str = Query(..., min_length=4, max_length=30)):
    return portal_controller.verify_document(document_number)


@router.post("/auth/register/send-otp", tags=["auth"])
def send_otp():
    return portal_controller.send_otp()


@router.get("/public/cases/lookup", tags=["public"])
def lookup_case(
    case_code: str = Query(..., min_length=1, max_length=40),
    document_number: str = Query(..., min_length=4, max_length=30),
):
    return _execute(
        lambda: portal_controller.fetch_quick_case(case_code, document_number)
    )


@router.get("/public/cases/{case_code}", tags=["public"])
def get_public_case(case_code: str):
    return _execute(lambda: portal_controller.fetch_quick_case(case_code))


@router.get("/public/service-status", tags=["public"])
def get_service_status(segment: str | None = Query(default=None)):
    return portal_controller.fetch_service_status(segment)


@router.get("/client/module", tags=["client"])
def get_client_module(client: ClientUser):
    return _execute(lambda: portal_controller.fetch_client_module(client))


@router.post("/client/claims", response_model=ActionOut, tags=["client"])
def create_claim(client: ClientUser, payload: CaseCreateIn = Body(...)):
    return _execute(
        lambda: portal_controller.create_customer_case(
            client, CaseType.CLAIM, payload
        )
    )


@router.post("/client/incidents", response_model=ActionOut, tags=["client"])
def create_incident(client: ClientUser, payload: CaseCreateIn = Body(...)):
    return _execute(
        lambda: portal_controller.create_customer_case(
            client, CaseType.INCIDENT, payload
        )
    )


@router.get("/supervisor/module", tags=["supervisor"])
def get_supervisor_module(supervisor: SupervisorUser):
    return _execute(lambda: portal_controller.fetch_supervisor_module(supervisor))


@router.get("/admin/module", tags=["admin"])
def get_admin_module(admin: AdminUser):
    return _execute(lambda: portal_controller.fetch_admin_module(admin))


def _execute(operation):
    try:
        return operation()
    except PortalNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except PortalValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
