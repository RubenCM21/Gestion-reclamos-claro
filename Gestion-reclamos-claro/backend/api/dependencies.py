from typing import Annotated

from fastapi import Header, HTTPException, status

from business_logic.auth import InvalidSessionError, fetch_active_user
from dao.models import UserModel
from dao.models.enums import UserRole


def bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debes enviar un token Bearer valido.",
        )

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debes enviar un token Bearer valido.",
        )
    return token


def require_advisor(
    authorization: Annotated[str | None, Header()] = None,
) -> UserModel:
    try:
        user = fetch_active_user(bearer_token(authorization))
    except InvalidSessionError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc

    if user.role != UserRole.OPERATOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Esta operacion requiere el rol de asesor.",
        )
    return user
