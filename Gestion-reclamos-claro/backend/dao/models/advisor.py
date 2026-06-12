from django.db import models

from dao.models.auditable_models import AuditableModel
from dao.models.service import Service
from dao.models.user import User


class CaseType(models.TextChoices):
    CLAIM = "RECLAMO", "Reclamo"
    INCIDENT = "INCIDENCIA", "Incidencia"
    INQUIRY = "CONSULTA", "Consulta"
    REQUEST = "SOLICITUD", "Solicitud"


class Area(AuditableModel):
    id = models.AutoField(primary_key=True, db_column="area_id")
    name = models.CharField(max_length=120, unique=True, db_column="nombre")
    description = models.CharField(
        max_length=250, null=True, blank=True, db_column="descripcion"
    )
    active = models.BooleanField(default=True, db_column="activo")

    class Meta:
        db_table = "areas"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Customer(models.Model):
    class CustomerType(models.TextChoices):
        PERSON = "PERSONA", "Persona"
        COMPANY = "EMPRESA", "Empresa"

    id = models.AutoField(primary_key=True, db_column="cliente_id")
    user = models.OneToOneField(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="customer_profile",
        db_column="usuario_id",
    )
    customer_type = models.CharField(
        max_length=20, choices=CustomerType.choices, db_column="tipo_cliente"
    )
    first_name = models.CharField(
        max_length=120, null=True, blank=True, db_column="nombres"
    )
    last_name = models.CharField(
        max_length=120, null=True, blank=True, db_column="apellidos"
    )
    business_name = models.CharField(
        max_length=200, null=True, blank=True, db_column="razon_social"
    )
    document_type = models.CharField(max_length=20, db_column="documento_tipo")
    document_number = models.CharField(
        max_length=30, unique=True, db_column="documento_numero"
    )
    email = models.EmailField(max_length=200, db_column="correo")
    phone = models.CharField(max_length=30, null=True, blank=True, db_column="telefono")
    address = models.CharField(
        max_length=250, null=True, blank=True, db_column="direccion"
    )
    active = models.BooleanField(default=True, db_column="activo")
    created_at = models.DateTimeField(auto_now_add=True, db_column="fecha_creacion")

    class Meta:
        db_table = "clientes"
        ordering = ["document_number"]

    @property
    def display_name(self):
        if self.customer_type == self.CustomerType.COMPANY:
            return self.business_name or self.document_number
        return " ".join(filter(None, [self.first_name, self.last_name])).strip()

    def __str__(self):
        return self.display_name


class CaseCategory(models.Model):
    id = models.AutoField(primary_key=True, db_column="categoria_id")
    case_type = models.CharField(
        max_length=20, choices=CaseType.choices, db_column="tipo_caso"
    )
    name = models.CharField(max_length=120, db_column="nombre")
    description = models.CharField(
        max_length=250, null=True, blank=True, db_column="descripcion"
    )
    active = models.BooleanField(default=True, db_column="activo")

    class Meta:
        db_table = "categorias"
        ordering = ["case_type", "name"]
        constraints = [
            models.UniqueConstraint(
                fields=["case_type", "name"], name="unique_case_category"
            )
        ]

    def __str__(self):
        return self.name


class CasePriority(models.Model):
    id = models.AutoField(primary_key=True, db_column="prioridad_id")
    name = models.CharField(max_length=60, unique=True, db_column="nombre")
    level = models.PositiveSmallIntegerField(db_column="nivel")
    description = models.CharField(
        max_length=250, null=True, blank=True, db_column="descripcion"
    )
    target_hours = models.PositiveIntegerField(
        default=24, db_column="tiempo_objetivo_horas"
    )
    active = models.BooleanField(default=True, db_column="activo")

    class Meta:
        db_table = "prioridades"
        ordering = ["level"]

    def __str__(self):
        return self.name


class CaseStatus(models.Model):
    id = models.AutoField(primary_key=True, db_column="estado_caso_id")
    name = models.CharField(max_length=100, unique=True, db_column="nombre")
    description = models.CharField(
        max_length=250, null=True, blank=True, db_column="descripcion"
    )
    final = models.BooleanField(default=False, db_column="es_final")
    visible_customer = models.BooleanField(default=True, db_column="visible_cliente")
    order = models.PositiveSmallIntegerField(default=1, db_column="orden")
    active = models.BooleanField(default=True, db_column="activo")

    class Meta:
        db_table = "estados_caso"
        ordering = ["order"]

    def __str__(self):
        return self.name


class Case(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="caso_id")
    code = models.CharField(max_length=40, unique=True, db_column="codigo_caso")
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="cases",
        db_column="cliente_id",
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name="cases",
        db_column="servicio_id",
    )
    case_type = models.CharField(
        max_length=20, choices=CaseType.choices, db_column="tipo_caso"
    )
    category = models.ForeignKey(
        CaseCategory,
        on_delete=models.PROTECT,
        related_name="cases",
        db_column="categoria_id",
    )
    channel = models.CharField(max_length=60, db_column="canal_ingreso")
    priority = models.ForeignKey(
        CasePriority,
        on_delete=models.PROTECT,
        related_name="cases",
        db_column="prioridad_id",
    )
    status = models.ForeignKey(
        CaseStatus,
        on_delete=models.PROTECT,
        related_name="cases",
        db_column="estado_caso_id",
    )
    current_area = models.ForeignKey(
        Area,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="current_cases",
        db_column="area_actual_id",
    )
    responsible = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_cases",
        db_column="responsable_actual_usuario_id",
    )
    created_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_cases",
        db_column="creado_por_usuario_id",
    )
    closed_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="closed_cases",
        db_column="cerrado_por_usuario_id",
    )
    title = models.CharField(max_length=220, db_column="titulo")
    description = models.TextField(db_column="descripcion")
    registered_at = models.DateTimeField(auto_now_add=True, db_column="fecha_registro")
    response_due_at = models.DateTimeField(
        null=True, blank=True, db_column="fecha_limite_respuesta"
    )
    resolution_due_at = models.DateTimeField(
        null=True, blank=True, db_column="fecha_limite_resolucion"
    )
    updated_at = models.DateTimeField(
        auto_now=True, db_column="fecha_ultima_actualizacion"
    )
    closed_at = models.DateTimeField(null=True, blank=True, db_column="fecha_cierre")
    final_solution = models.TextField(
        null=True, blank=True, db_column="solucion_final"
    )
    pending_customer = models.BooleanField(
        default=False, db_column="pendiente_cliente"
    )

    class Meta:
        db_table = "casos"
        ordering = ["resolution_due_at", "-registered_at"]
        indexes = [
            models.Index(fields=["responsible", "status"], name="case_owner_status_idx"),
            models.Index(fields=["resolution_due_at"], name="case_resolution_due_idx"),
            models.Index(fields=["code"], name="case_code_idx"),
        ]

    def __str__(self):
        return f"{self.code} - {self.title}"


class CaseAssignment(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="asignacion_id")
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="assignments",
        db_column="caso_id",
    )
    source_user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="case_assignments_sent",
        db_column="usuario_origen_id",
    )
    source_area = models.ForeignKey(
        Area,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="case_assignments_sent",
        db_column="area_origen_id",
    )
    destination_user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="case_assignments_received",
        db_column="usuario_destino_id",
    )
    destination_area = models.ForeignKey(
        Area,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="case_assignments_received",
        db_column="area_destino_id",
    )
    assigned_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="case_assignments_created",
        db_column="asignado_por_usuario_id",
    )
    movement_type = models.CharField(max_length=40, db_column="tipo_movimiento")
    reason = models.TextField(db_column="motivo")
    assigned_at = models.DateTimeField(auto_now_add=True, db_column="fecha_asignacion")

    class Meta:
        db_table = "asignaciones_caso"
        ordering = ["-assigned_at"]


class CaseHistory(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="historial_id")
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="history",
        db_column="caso_id",
    )
    user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="case_history_entries",
        db_column="usuario_id",
    )
    previous_status = models.ForeignKey(
        CaseStatus,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="history_as_previous",
        db_column="estado_anterior_id",
    )
    new_status = models.ForeignKey(
        CaseStatus,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="history_as_new",
        db_column="estado_nuevo_id",
    )
    action = models.CharField(max_length=80, db_column="accion")
    summary = models.CharField(
        max_length=220, null=True, blank=True, db_column="resumen"
    )
    observation = models.TextField(db_column="observacion")
    visible_customer = models.BooleanField(
        default=True, db_column="es_visible_cliente"
    )
    event_at = models.DateTimeField(auto_now_add=True, db_column="fecha_evento")

    class Meta:
        db_table = "historial_caso"
        ordering = ["-event_at"]
        indexes = [
            models.Index(fields=["case", "event_at"], name="case_history_date_idx")
        ]


class CaseEvidence(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="evidencia_id")
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="evidence",
        db_column="caso_id",
    )
    history = models.ForeignKey(
        CaseHistory,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="evidence",
        db_column="historial_id",
    )
    user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="case_evidence",
        db_column="usuario_id",
    )
    file_name = models.CharField(max_length=250, db_column="nombre_archivo")
    file_path = models.CharField(max_length=500, db_column="ruta_archivo")
    mime_type = models.CharField(max_length=150, db_column="tipo_mime")
    size_bytes = models.PositiveBigIntegerField(default=0, db_column="tamano_bytes")
    description = models.CharField(
        max_length=300, null=True, blank=True, db_column="descripcion"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True, db_column="fecha_carga")

    class Meta:
        db_table = "evidencias"
        ordering = ["-uploaded_at"]


class CaseCommunication(models.Model):
    class CommunicationType(models.TextChoices):
        INFORMATION_REQUEST = "SOLICITUD_INFORMACION", "Solicitud de informacion"
        SLA_REMINDER = "RECORDATORIO_SLA", "Recordatorio SLA"
        TEMPLATE_RESPONSE = "RESPUESTA_PLANTILLA", "Respuesta con plantilla"

    id = models.BigAutoField(primary_key=True, db_column="comunicacion_id")
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="communications",
        db_column="caso_id",
    )
    user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="case_communications",
        db_column="usuario_id",
    )
    communication_type = models.CharField(
        max_length=40, choices=CommunicationType.choices, db_column="tipo"
    )
    channel = models.CharField(max_length=60, db_column="canal_envio")
    subject = models.CharField(max_length=220, db_column="asunto")
    message = models.TextField(db_column="mensaje")
    deadline_at = models.DateTimeField(null=True, blank=True, db_column="fecha_limite")
    sent_at = models.DateTimeField(auto_now_add=True, db_column="fecha_envio")

    class Meta:
        db_table = "comunicaciones_caso"
        ordering = ["-sent_at"]


class AdvisorNotification(models.Model):
    id = models.BigAutoField(primary_key=True, db_column="notificacion_id")
    case = models.ForeignKey(
        Case,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="notifications",
        db_column="caso_id",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
        db_column="usuario_id",
    )
    notification_type = models.CharField(max_length=50, db_column="tipo")
    channel = models.CharField(default="SISTEMA", max_length=40, db_column="canal_envio")
    title = models.CharField(max_length=220, db_column="titulo")
    message = models.TextField(db_column="mensaje")
    priority = models.CharField(default="media", max_length=20, db_column="prioridad")
    read = models.BooleanField(default=False, db_column="leida")
    generated_at = models.DateTimeField(auto_now_add=True, db_column="fecha_generacion")
    read_at = models.DateTimeField(null=True, blank=True, db_column="fecha_lectura")
    delivery_status = models.CharField(
        default="GENERADO", max_length=30, db_column="estado_envio"
    )

    class Meta:
        db_table = "notificaciones"
        ordering = ["read", "-generated_at"]
        indexes = [
            models.Index(fields=["user", "read"], name="notification_user_read_idx")
        ]


class ResponseTemplate(AuditableModel):
    id = models.BigAutoField(primary_key=True, db_column="plantilla_id")
    code = models.CharField(max_length=40, unique=True, db_column="codigo")
    name = models.CharField(max_length=160, db_column="nombre")
    category = models.CharField(max_length=60, db_column="categoria")
    channel = models.CharField(max_length=100, db_column="canal")
    description = models.CharField(
        max_length=250, null=True, blank=True, db_column="descripcion"
    )
    body = models.TextField(db_column="contenido")
    active = models.BooleanField(default=True, db_column="activo")
    created_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="response_templates",
        db_column="creado_por_usuario_id",
    )

    class Meta:
        db_table = "plantillas_respuesta"
        ordering = ["category", "name"]

    def __str__(self):
        return self.name
