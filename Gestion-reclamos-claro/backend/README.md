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

La configuracion por defecto conecta a PostgreSQL en `localhost:5432`, usando:

```text
database: gestion_reclamos
user: postgres
password: postgres
```
