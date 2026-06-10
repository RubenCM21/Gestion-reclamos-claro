import os

import django
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from api.auth import router as auth_router  # noqa: E402
from api.home import router as home_router  # noqa: E402
from api.user import router as user_router  # noqa: E402


app = FastAPI(
    title="Gestion de reclamos Claro API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(home_router, prefix="/api/public", tags=["public"])
app.include_router(user_router, prefix="/api/users", tags=["users"])


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
