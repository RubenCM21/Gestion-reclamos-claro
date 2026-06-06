import uuid

from django.db import models

from dao.models.auditable_models import AuditableModel
from dao.models.enums import UserRole


class User(AuditableModel):
    class Meta:
        db_table = "viru_user"
        constraints = [
            models.UniqueConstraint(
                fields=["username"],
                name="unique_user",
            )
        ]

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True
    )
    hashed_password = models.CharField(max_length=200)
    full_name = models.CharField(max_length=200)
    username = models.CharField(max_length=200)
    role = models.CharField(
        max_length=50, choices=UserRole.choices, default=UserRole.OPERATOR
    )
