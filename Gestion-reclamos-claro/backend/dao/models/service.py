from django.db import models


class Service(models.Model):
    id = models.AutoField(primary_key=True, db_column="servicio_id")
    name = models.CharField(max_length=100, unique=True, db_column="nombre")
    description = models.CharField(
        max_length=250, null=True, blank=True, db_column="descripcion"
    )
    active = models.BooleanField(default=True, db_column="activo")

    class Meta:
        db_table = "servicios"
        ordering = ["id"]

    def __str__(self):
        return self.name
