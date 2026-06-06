from django.db import models


class UserRole(models.TextChoices):
    ADMIN = "ADMIN", "Admin"
    OPERATOR = "OPERATOR", "Operator"
    SUPERVISOR = "SUPERVISOR", "Supervisor"
