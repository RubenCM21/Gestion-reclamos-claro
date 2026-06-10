from django.contrib.auth.hashers import make_password

from dao.models import UserModel
from dao.models.enums import UserRole
from schemas.user import UserIn, UserOut, UserRolesToCreate, UsersOut


class UserAlreadyExistsError(ValueError):
    pass


class InvalidUserRoleError(ValueError):
    pass


def _role_value(role: UserRolesToCreate | str) -> str:
    return role.value if hasattr(role, "value") else str(role)


def _to_user_out(user: UserModel) -> UserOut:
    if hasattr(UserOut, "model_validate"):
        return UserOut.model_validate(user)
    return UserOut.from_orm(user)


def create_user(user_in: UserIn, role: UserRolesToCreate) -> UserOut:
    """
    Create a new user
    """
    role_value = _role_value(role)

    if role_value == UserRole.ADMIN:
        raise InvalidUserRoleError("An ADMIN user cannot be created from this endpoint") # noqa

    if role_value not in UserRolesToCreate.values:
        raise InvalidUserRoleError(f"Invalid role: {role_value}")

    if UserModel.objects.filter(username=user_in.username).exists():
        raise UserAlreadyExistsError("This username already exists")

    user = UserModel.objects.create(
        username=user_in.username,
        full_name=user_in.full_name,
        hashed_password=make_password(user_in.password),
        role=role_value,
    )

    return _to_user_out(user)


def fetch_users() -> UsersOut:
    """
    Fetch all users that are not ADMINS
    """
    users = UserModel.objects.exclude(role=UserRole.ADMIN).order_by(
        "full_name", "username"
    )

    return UsersOut(users=[_to_user_out(user) for user in users])
