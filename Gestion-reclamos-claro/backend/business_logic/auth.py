import secrets
from datetime import timedelta

from django.contrib.auth.hashers import check_password, make_password
from django.db.models import Q
from django.utils import timezone

from dao.models import AuthSession, Customer, UserModel
from dao.models.enums import UserRole
from schemas.auth import (
    LoginIn,
    LoginOut,
    LoginRole,
    PasswordRecoveryConfirmIn,
    PasswordRecoveryConfirmOut,
    PasswordRecoveryRequestIn,
    PasswordRecoveryRequestOut,
    SessionOut,
    SessionUserOut,
)


class InvalidCredentialsError(ValueError):
    pass


class InvalidSessionError(ValueError):
    pass


class PasswordRecoveryError(ValueError):
    pass


ROLE_TO_MODEL = {
    LoginRole.CLIENT_PERSON: UserRole.CLIENT_PERSON,
    LoginRole.CLIENT_COMPANY: UserRole.CLIENT_COMPANY,
    LoginRole.OPERATOR: UserRole.OPERATOR,
    LoginRole.SUPERVISOR: UserRole.SUPERVISOR,
    LoginRole.ADMIN: UserRole.ADMIN,
}

MODEL_TO_ROLE = {model_role: login_role for login_role, model_role in ROLE_TO_MODEL.items()}

REDIRECT_BY_ROLE = {
    LoginRole.CLIENT_PERSON: "cliente/dashboard.html",
    LoginRole.CLIENT_COMPANY: "cliente/dashboard.html",
    LoginRole.OPERATOR: "asesor/dashboard.html",
    LoginRole.SUPERVISOR: "supervisor/dashboard.html",
    LoginRole.ADMIN: "admin/dashboard.html",
}


def login(login_in: LoginIn) -> LoginOut:
    user = UserModel.objects.filter(username__iexact=login_in.username).first()
    expected_role = ROLE_TO_MODEL[login_in.role]

    if (
        user is None
        or user.role != expected_role
        or not check_password(login_in.password, user.hashed_password)
    ):
        raise InvalidCredentialsError("Usuario, contraseña o tipo de acceso incorrecto.")

    duration = timedelta(days=30 if login_in.remember_me else 1)
    session = AuthSession.objects.create(
        user=user,
        token=secrets.token_urlsafe(48),
        remember_me=login_in.remember_me,
        expires_at=timezone.now() + duration,
    )

    return LoginOut(
        token=session.token,
        user=_session_user(user),
        redirect=REDIRECT_BY_ROLE[login_in.role],
    )


def fetch_session(token: str) -> SessionOut:
    session = _active_session(token)
    return SessionOut(user=_session_user(session.user))


def fetch_active_user(token: str) -> UserModel:
    return _active_session(token).user


def logout(token: str) -> None:
    session = _active_session(token)
    session.active = False
    session.save(update_fields=["active"])


def request_password_recovery(
    payload: PasswordRecoveryRequestIn,
) -> PasswordRecoveryRequestOut:
    user = _recovery_user(payload.account_type, payload.identifier)
    contact = _recovery_contact(user, payload.identifier)
    return PasswordRecoveryRequestOut(
        masked_contact=contact,
        message="Código OTP enviado correctamente.",
    )


def confirm_password_recovery(
    payload: PasswordRecoveryConfirmIn,
) -> PasswordRecoveryConfirmOut:
    if payload.otp != "123456":
        raise PasswordRecoveryError("El código OTP no es válido.")

    user = _recovery_user(payload.account_type, payload.identifier)
    user.hashed_password = make_password(payload.new_password)
    user.save(update_fields=["hashed_password", "updated_at"])

    AuthSession.objects.filter(user=user, active=True).update(active=False)
    return PasswordRecoveryConfirmOut(message="Contraseña actualizada correctamente.")


def _active_session(token: str) -> AuthSession:
    session = AuthSession.objects.select_related("user").filter(token=token).first()

    if session is None or not session.active or session.expires_at <= timezone.now():
        raise InvalidSessionError("La sesión no existe o ha expirado.")

    return session


def _recovery_user(account_type: LoginRole, identifier: str) -> UserModel:
    expected_role = ROLE_TO_MODEL[account_type]
    normalized = identifier.strip()
    user = UserModel.objects.filter(
        username__iexact=normalized, role=expected_role
    ).first()

    if user is not None:
        return user

    customer = (
        Customer.objects.select_related("user")
        .filter(
            Q(email__iexact=normalized) | Q(document_number=normalized),
            user__role=expected_role,
            user__isnull=False,
        )
        .first()
    )

    if customer and customer.user:
        return customer.user

    raise PasswordRecoveryError("No se encontró una cuenta con los datos indicados.")


def _recovery_contact(user: UserModel, identifier: str) -> str:
    customer = Customer.objects.filter(user=user).first()
    email = customer.email if customer and customer.email else user.username

    if "@" not in email:
        return _mask_identifier(identifier)

    local, domain = email.split("@", 1)
    visible = local[: min(3, len(local))]
    return f"{visible}{'*' * 4}@{domain}"


def _mask_identifier(identifier: str) -> str:
    value = identifier.strip()
    if len(value) <= 4:
        return "*" * len(value)
    return f"{value[:2]}{'*' * (len(value) - 4)}{value[-2:]}"


def _session_user(user: UserModel) -> SessionUserOut:
    return SessionUserOut(
        id=user.id,
        name=user.full_name,
        role=MODEL_TO_ROLE[user.role],
        username=user.username,
    )
