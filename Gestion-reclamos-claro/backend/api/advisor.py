from collections.abc import Callable
from typing import Annotated, Any

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status

from api.dependencies import require_advisor
from business_logic import advisor as advisor_controller
from business_logic.advisor import (
    AdvisorCaseNotFoundError,
    AdvisorResourceNotFoundError,
    AdvisorValidationError,
)
from dao.models import UserModel
from schemas.advisor import (
    AdvisorActionOut,
    AdvisorCaseDetailOut,
    AdvisorCasesOut,
    AdvisorCatalogsOut,
    AdvisorDashboardOut,
    AdvisorNotificationOut,
    AdvisorNotificationsOut,
    AdvisorPerformanceOut,
    CaseCloseIn,
    CaseDeriveIn,
    CaseUpdateIn,
    CustomerInformationRequestIn,
    EvidenceIn,
    NotificationActionOut,
    ResponseTemplateCreateIn,
    ResponseTemplateOut,
    ResponseTemplatesOut,
    SlaFollowUpIn,
    SlaReminderIn,
    TemplateSendIn,
)


router = APIRouter()
AdvisorUser = Annotated[UserModel, Depends(require_advisor)]


@router.get("/dashboard", response_model=AdvisorDashboardOut)
def get_dashboard(advisor: AdvisorUser):
    return _execute(lambda: advisor_controller.fetch_dashboard(advisor))


@router.get("/catalogs", response_model=AdvisorCatalogsOut)
def get_catalogs(advisor: AdvisorUser):
    return _execute(advisor_controller.fetch_catalogs)


@router.get("/cases", response_model=AdvisorCasesOut)
def get_cases(
    advisor: AdvisorUser,
    search: str | None = Query(default=None, max_length=200),
    priority: str | None = Query(default=None, max_length=60),
    case_status: str | None = Query(default=None, alias="status", max_length=100),
    queue_status: str | None = Query(default=None, max_length=100),
    sla_risk: bool = Query(default=False),
):
    return _execute(
        lambda: advisor_controller.fetch_cases(
            advisor=advisor,
            search=search,
            priority=priority,
            status=case_status,
            queue_status=queue_status,
            sla_risk=sla_risk,
        )
    )


@router.get("/cases/{case_code}", response_model=AdvisorCaseDetailOut)
def get_case(case_code: str, advisor: AdvisorUser):
    return _execute(lambda: advisor_controller.fetch_case_detail(advisor, case_code))


@router.post("/cases/{case_code}/updates", response_model=AdvisorActionOut)
def update_case(
    case_code: str,
    advisor: AdvisorUser,
    payload: CaseUpdateIn = Body(...),
):
    return _execute(lambda: advisor_controller.update_case(advisor, case_code, payload))


@router.post("/cases/{case_code}/information-requests", response_model=AdvisorActionOut)
def request_customer_information(
    case_code: str,
    advisor: AdvisorUser,
    payload: CustomerInformationRequestIn = Body(...),
):
    return _execute(
        lambda: advisor_controller.request_customer_information(
            advisor, case_code, payload
        )
    )


@router.post("/cases/{case_code}/derive", response_model=AdvisorActionOut)
def derive_case(
    case_code: str,
    advisor: AdvisorUser,
    payload: CaseDeriveIn = Body(...),
):
    return _execute(lambda: advisor_controller.derive_case(advisor, case_code, payload))


@router.post("/cases/{case_code}/close", response_model=AdvisorActionOut)
def close_case(
    case_code: str,
    advisor: AdvisorUser,
    payload: CaseCloseIn = Body(...),
):
    return _execute(lambda: advisor_controller.close_case(advisor, case_code, payload))


@router.post("/cases/{case_code}/evidence", response_model=AdvisorActionOut)
def add_evidence(
    case_code: str,
    advisor: AdvisorUser,
    payload: EvidenceIn = Body(...),
):
    return _execute(lambda: advisor_controller.add_evidence(advisor, case_code, payload))


@router.post("/cases/{case_code}/sla-reminders", response_model=AdvisorActionOut)
def send_sla_reminder(
    case_code: str,
    advisor: AdvisorUser,
    payload: SlaReminderIn = Body(...),
):
    return _execute(
        lambda: advisor_controller.send_sla_reminder(advisor, case_code, payload)
    )


@router.post("/cases/{case_code}/sla-follow-ups", response_model=AdvisorActionOut)
def register_sla_follow_up(
    case_code: str,
    advisor: AdvisorUser,
    payload: SlaFollowUpIn = Body(...),
):
    return _execute(
        lambda: advisor_controller.register_sla_follow_up(
            advisor, case_code, payload
        )
    )


@router.get("/templates", response_model=ResponseTemplatesOut)
def get_templates(
    advisor: AdvisorUser,
    search: str | None = Query(default=None, max_length=200),
    category: str | None = Query(default=None, max_length=60),
):
    return _execute(lambda: advisor_controller.fetch_templates(search, category))


@router.post(
    "/templates",
    response_model=ResponseTemplateOut,
    status_code=status.HTTP_201_CREATED,
)
def create_template(
    advisor: AdvisorUser,
    payload: ResponseTemplateCreateIn = Body(...),
):
    return _execute(lambda: advisor_controller.create_template(advisor, payload))


@router.post("/templates/{template_id}/send", response_model=AdvisorActionOut)
def send_template(
    template_id: int,
    advisor: AdvisorUser,
    payload: TemplateSendIn = Body(...),
):
    return _execute(
        lambda: advisor_controller.send_template(advisor, template_id, payload)
    )


@router.get("/notifications", response_model=AdvisorNotificationsOut)
def get_notifications(
    advisor: AdvisorUser,
    search: str | None = Query(default=None, max_length=200),
    notification_type: str | None = Query(default=None, max_length=50),
    priority: str | None = Query(default=None, max_length=20),
    unread_only: bool = Query(default=False),
):
    return _execute(
        lambda: advisor_controller.fetch_notifications(
            advisor=advisor,
            search=search,
            notification_type=notification_type,
            priority=priority,
            unread_only=unread_only,
        )
    )


@router.patch(
    "/notifications/{notification_id}/read",
    response_model=AdvisorNotificationOut,
)
def mark_notification_read(notification_id: int, advisor: AdvisorUser):
    return _execute(
        lambda: advisor_controller.mark_notification_read(advisor, notification_id)
    )


@router.post("/notifications/read-all", response_model=NotificationActionOut)
def mark_all_notifications_read(advisor: AdvisorUser):
    return _execute(
        lambda: advisor_controller.mark_all_notifications_read(advisor)
    )


@router.delete("/notifications/read", response_model=NotificationActionOut)
def delete_read_notifications(advisor: AdvisorUser):
    return _execute(lambda: advisor_controller.delete_read_notifications(advisor))


@router.get("/performance", response_model=AdvisorPerformanceOut)
def get_performance(
    advisor: AdvisorUser,
    period: str = Query(default="week", pattern="^(week|month)$"),
):
    return _execute(lambda: advisor_controller.fetch_performance(advisor, period))


def _execute(operation: Callable[[], Any]):
    try:
        return operation()
    except AdvisorCaseNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except AdvisorResourceNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except AdvisorValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
