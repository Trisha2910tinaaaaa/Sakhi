"""Sakhi FastAPI application entrypoint."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import affirmations, ai, auth, community, journal, therapists
from database import Base, engine
from schema_ensure import ensure_schema

import models  # noqa: F401 — register ORM metadata with Base before create_all

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """
    Application lifespan hook.

    Creates database tables when missing (dev / first deploy). For long-term production
    maintenance, prefer Alembic migrations instead of create_all.
    """
    try:
        Base.metadata.create_all(bind=engine)
        # Ensure Supabase already has required columns/tables.
        ensure_schema()
    except Exception:
        logger.exception("Database initialization failed (check DATABASE_URL and connectivity)")
        raise
    yield


app = FastAPI(
    title="Sakhi API",
    description="Mental Wellness Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)
app.include_router(journal.router, prefix=API_PREFIX)
app.include_router(community.router, prefix=API_PREFIX)
app.include_router(affirmations.router, prefix=API_PREFIX)
app.include_router(therapists.router, prefix=API_PREFIX)
app.include_router(therapists.bookings_router, prefix=API_PREFIX)


@app.get("/")
def read_root() -> dict:
    """Root banner with service metadata."""
    return {"message": "Welcome to Sakhi API", "status": "running"}


@app.get("/health")
def health_check() -> dict:
    """Liveness probe for load balancers and monitors."""
    return {"status": "healthy"}
