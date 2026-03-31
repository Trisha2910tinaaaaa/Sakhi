"""Sakhi FastAPI application entrypoint."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api import affirmations, ai, auth, community, journal, therapists
from database import Base, engine, get_db, check_db_health
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
        logger.info("🔄 Initializing database...")
        Base.metadata.create_all(bind=engine)
        # Ensure Supabase already has required columns/tables.
        ensure_schema()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.exception(f"❌ Database initialization failed: {e}")
        raise
    yield
    logger.info("👋 Sakhi API shutting down")


app = FastAPI(
    title="Sakhi API",
    description="Mental Wellness Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://sakhi.vercel.app",  # Production frontend
        "https://*.onrender.com",     # Render backend domains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api"

# Include all routers
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)
app.include_router(journal.router, prefix=API_PREFIX)
app.include_router(community.router, prefix=API_PREFIX)
app.include_router(affirmations.router, prefix=API_PREFIX)
app.include_router(therapists.router, prefix=API_PREFIX)
app.include_router(therapists.bookings_router, prefix=API_PREFIX)


@app.get("/")
def read_root() -> Dict[str, Any]:
    """Root banner with service metadata."""
    return {
        "message": "Welcome to Sakhi API",
        "status": "running",
        "version": "1.0.0",
        "documentation": "/docs"
    }


@app.get("/health")
def health_check() -> Dict[str, Any]:
    """
    Comprehensive health check endpoint.
    
    Returns:
        - API status
        - Database connection status
        - Database version (if connected)
        - Service metadata
    """
    health_status = {
        "status": "healthy",
        "api": "running",
        "database": {
            "status": "unknown",
            "message": None,
            "version": None
        },
        "timestamp": __import__("datetime").datetime.utcnow().isoformat()
    }
    
    # Check database connection
    try:
        db = next(get_db())
        # Execute a simple query to verify connection
        result = db.execute(text("SELECT version()"))
        version = result.fetchone()[0]
        
        health_status["database"]["status"] = "connected"
        health_status["database"]["version"] = version.split(",")[0] if version else "unknown"
        health_status["database"]["message"] = "Database connection successful"
        
        db.close()
        
    except SQLAlchemyError as e:
        health_status["status"] = "degraded"
        health_status["database"]["status"] = "disconnected"
        health_status["database"]["message"] = f"Database error: {str(e)}"
        logger.error(f"Database health check failed: {e}")
        
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["database"]["status"] = "error"
        health_status["database"]["message"] = f"Connection error: {str(e)}"
        logger.error(f"Health check failed: {e}")
    
    # Determine overall status
    if health_status["database"]["status"] != "connected":
        health_status["status"] = "degraded"
    
    return health_status


@app.get("/health/live")
def liveness_check() -> Dict[str, str]:
    """
    Simple liveness probe for load balancers.
    Returns 200 if the API is running, regardless of database.
    """
    return {"status": "alive"}


@app.get("/health/ready")
def readiness_check() -> Dict[str, Any]:
    """
    Readiness probe - checks if the API is ready to serve requests.
    Returns 200 only when database is connected.
    """
    try:
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        return {"status": "not ready", "database": "disconnected", "error": str(e)}
