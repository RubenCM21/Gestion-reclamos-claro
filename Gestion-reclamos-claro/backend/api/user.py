from fastapi import APIRouter, Body, HTTPException, Query, status

from business_logic import user_controller
from business_logic.user import InvalidUserRoleError, UserAlreadyExistsError
from schemas import UserIn, UserOut, UsersOut
from schemas.user import UserRolesToCreate

router = APIRouter()


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=UserOut,
)
def create_user(
    user_in: UserIn = Body(..., description="Data of a new user"),
    role: UserRolesToCreate = Query(..., description="New status for the report"),
):
    """
    Create a new user given the required information.
    The created user must be OPERATOR or SUPERVISOR, not ADMIN

    ### Available roles
    - Admin

    ### Field Length
    - username: 60 characters
    - password: 100 characters
    - full name: 60 characters

    ### Exceptions
    - USER_ERROR_002: This username already exists
    - USER_ERROR_003: An ADMIN cannot create another ADMIN
    """
    try:
        user = user_controller.create_user(user_in=user_in, role=role)
    except (InvalidUserRoleError, UserAlreadyExistsError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc

    return user


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=UsersOut,
)
def fetch_users():
    """
    List all the non-ADMIN users

    ### Available roles
    - Admin
    """
    return user_controller.fetch_users()
