# Backend

## Base de datos con Docker Desktop

Levantar PostgreSQL:

```bash
docker compose up -d
```

Verificar que el contenedor este activo:

```bash
docker compose ps
```

## Entorno Python

Crear y activar entorno virtual:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Instalar dependencias:

```bash
pip install -r requirements.txt
```

## Migraciones

Crear migraciones del DAO:

```bash
python manage.py makemigrations dao
```

Aplicar migraciones a PostgreSQL:

```bash
python manage.py migrate
```

## API

Iniciar el servidor:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Documentacion interactiva:

```text
http://localhost:8000/docs
```

Comprobar el servidor:

```text
http://localhost:8000/health
```

APIs publicas de la primera vista:

```text
GET http://localhost:8000/api/public/home?segment=personas
GET http://localhost:8000/api/public/home?segment=empresas
GET http://localhost:8000/api/public/services
GET http://localhost:8000/api/public/services?segment=personas
```

APIs de autenticacion:

```text
POST http://localhost:8000/api/auth/login
GET  http://localhost:8000/api/auth/session
POST http://localhost:8000/api/auth/logout
POST http://localhost:8000/api/auth/register
GET  http://localhost:8000/api/auth/register/verify-document?document_number=47859621
POST http://localhost:8000/api/auth/register/send-otp
```

Los accesos demo de `frontend/login.html` usan la contrasena `1234`.

## APIs publicas generales

Consulta rápida y estado de servicios:

```text
GET /api/public/cases/lookup?case_code=CAS-2026-0001&document_number=47859621
GET /api/public/cases/{case_code}
GET /api/public/service-status
GET /api/public/service-status?segment=personas
GET /api/public/service-status?segment=empresas
```

## API del cliente

Las rutas del cliente requieren token:

```text
Authorization: Bearer <token>
```

El usuario autenticado debe tener rol `CLIENT_PERSON` o `CLIENT_COMPANY`.

```text
GET  /api/client/module
POST /api/client/claims
POST /api/client/incidents
```

`GET /api/client/module` entrega la información agregada para las vistas del
cliente: perfil, casos, servicios, notificaciones y actividad.

## API del supervisor

Las rutas del supervisor requieren token y rol `SUPERVISOR`.

```text
GET /api/supervisor/module
```

Este endpoint entrega datos agregados para las vistas de supervisión: casos,
asesores, indicadores, auditoría, reglas de configuración y reportes.

## API del administrador

Las rutas del administrador requieren token y rol `ADMIN`.

```text
GET /api/admin/module
```

Este endpoint entrega datos agregados para las vistas administrativas: usuarios,
roles, permisos, catálogos, reglas SLA, métricas, integraciones, auditoría,
respaldos, alertas y configuración.

## API del asesor

Las rutas del asesor requieren el token obtenido en el login:

```text
Authorization: Bearer <token>
```

El usuario autenticado debe tener el rol `OPERATOR`. Las migraciones crean
catalogos, cinco casos demo, historial, evidencias, notificaciones y plantillas
para `asesor@demo.com`.

Lectura:

```text
GET /api/advisor/dashboard
GET /api/advisor/catalogs
GET /api/advisor/cases
GET /api/advisor/cases/{case_code}
GET /api/advisor/templates
GET /api/advisor/notifications
GET /api/advisor/performance?period=week
```

Operaciones de casos:

```text
POST /api/advisor/cases/{case_code}/updates
POST /api/advisor/cases/{case_code}/information-requests
POST /api/advisor/cases/{case_code}/derive
POST /api/advisor/cases/{case_code}/close
POST /api/advisor/cases/{case_code}/evidence
POST /api/advisor/cases/{case_code}/sla-reminders
POST /api/advisor/cases/{case_code}/sla-follow-ups
```

Plantillas y notificaciones:

```text
POST   /api/advisor/templates
POST   /api/advisor/templates/{template_id}/send
PATCH  /api/advisor/notifications/{notification_id}/read
POST   /api/advisor/notifications/read-all
DELETE /api/advisor/notifications/read
```

Filtros disponibles en la bandeja:

```text
GET /api/advisor/cases?search=internet
GET /api/advisor/cases?priority=Alta
GET /api/advisor/cases?status=En%20atencion
GET /api/advisor/cases?queue_status=Pendiente%20cliente
GET /api/advisor/cases?sla_risk=true
```

La carga de evidencia registra los metadatos y la ruta del archivo. El
almacenamiento binario debe ser atendido por el servicio de archivos que use el
despliegue.

## Pruebas

La configuracion de pruebas utiliza SQLite y no modifica PostgreSQL:

```bash
python manage.py test tests --settings=config.test_settings -v 2
```

La configuracion por defecto conecta a PostgreSQL en `localhost:5432`, usando:

```text
database: gestion_reclamos
user: postgres
password: postgres
```
