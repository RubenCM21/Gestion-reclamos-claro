from django.db import models


class UserRole(models.TextChoices):
    ADMIN = "ADMIN", "Admin"
    CLIENT_PERSON = "CLIENT_PERSON", "Client person"
    CLIENT_COMPANY = "CLIENT_COMPANY", "Client company"
    OPERATOR = "OPERATOR", "Operator"
    SUPERVISOR = "SUPERVISOR", "Supervisor"
