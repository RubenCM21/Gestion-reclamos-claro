from fastapi import APIRouter, Body, Header, HTTPException, status

from business_logic.auth import (
    InvalidCredentialsError,
    InvalidSessionError,
    fetch_session,
    login,
    logout,
)
from schemas.auth import LoginIn, LoginOut, LogoutOut, SessionOut


router = APIRouter()


@router.post("/login", response_model=LoginOut)
def login_user(login_in: LoginIn = Body(...)):
    try:
        return login(login_in)
    except InvalidCredentialsError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc


@router.get("/session", response_model=SessionOut)
def get_session(authorization: str | None = Header(None)):
    try:
        return fetch_session(_bearer_token(authorization))
    except InvalidSessionError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc


@router.post("/logout", response_model=LogoutOut)
def logout_user(authorization: str | None = Header(None)):
    try:
        logout(_bearer_token(authorization))
    except InvalidSessionError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc

    return LogoutOut()


def _bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise InvalidSessionError("Debes enviar un token Bearer válido.")
    return authorization.removeprefix("Bearer ").strip()
