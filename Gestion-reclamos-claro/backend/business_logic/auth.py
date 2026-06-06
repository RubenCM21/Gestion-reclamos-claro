import secrets
from datetime import timedelta

from django.contrib.auth.hashers import check_password
from django.utils import timezone

from dao.models import AuthSession, UserModel
from dao.models.enums import UserRole
from schemas.auth import LoginIn, LoginOut, LoginRole, SessionOut, SessionUserOut


class InvalidCredentialsError(ValueError):
    pass


class InvalidSessionError(ValueError):
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


def logout(token: str) -> None:
    session = _active_session(token)
    session.active = False
    session.save(update_fields=["active"])


def _active_session(token: str) -> AuthSession:
    session = AuthSession.objects.select_related("user").filter(token=token).first()

    if session is None or not session.active or session.expires_at <= timezone.now():
        raise InvalidSessionError("La sesión no existe o ha expirado.")

    return session


def _session_user(user: UserModel) -> SessionUserOut:
    return SessionUserOut(
        id=user.id,
        name=user.full_name,
        role=MODEL_TO_ROLE[user.role],
        username=user.username,
    )
