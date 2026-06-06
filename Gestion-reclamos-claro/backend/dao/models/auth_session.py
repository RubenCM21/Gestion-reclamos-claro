import uuid

from django.db import models

from dao.models.user import User


class AuthSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="auth_sessions",
    )
    token = models.CharField(max_length=200, unique=True)
    remember_me = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    active = models.BooleanField(default=True)

    class Meta:
        db_table = "sesiones_usuario"
        indexes = [
            models.Index(fields=["token"], name="auth_session_token_idx"),
            models.Index(fields=["user", "active"], name="auth_session_user_idx"),
        ]
