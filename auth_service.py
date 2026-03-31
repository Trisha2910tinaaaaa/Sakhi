"""JWT auth and recovery email hashing for Sakhi."""

from __future__ import annotations

import hashlib
import os
import random
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from uuid import UUID

from dotenv import load_dotenv
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from models import User

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

_ADJECTIVES = (
    "Brave",
    "Gentle",
    "Healing",
    "Hopeful",
    "Kind",
    "Radiant",
    "Resilient",
    "Serene",
    "Steady",
    "Warrior",
    "Wise",
    "Worthy",
)

_NOUNS = (
    "Heart",
    "Light",
    "Path",
    "Phoenix",
    "Seeker",
    "Soul",
    "Spirit",
    "Star",
    "Voice",
    "Bloom",
    "Garden",
    "Harbor",
)


def create_jwt_token(user: User) -> str:
    """Create a signed JWT that includes required claims.

    Required by spec:
      - user_id
      - username
      - created_at
    """
    if not JWT_SECRET or not str(JWT_SECRET).strip():
        raise ValueError("JWT_SECRET must be set to create tokens")

    created_at = user.created_at
    if created_at is None:
        created_at = datetime.now(timezone.utc)

    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "user_id": str(user.id),
        "username": user.username,
        "created_at": created_at.isoformat(),
        "exp": expire,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Validate a JWT and return decoded claims."""
    if not JWT_SECRET or not str(JWT_SECRET).strip():
        raise ValueError("JWT_SECRET must be set to verify tokens")
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


def get_current_user(token: str, db: Session) -> User:
    """Resolve current user from JWT claims."""
    payload = verify_jwt_token(token)
    user_id_raw = payload.get("user_id")
    if not user_id_raw:
        raise JWTError("Missing user_id in token")

    try:
        uid = UUID(str(user_id_raw))
    except ValueError as exc:
        raise JWTError("Invalid user_id format in token") from exc

    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise ValueError("User not found for token")
    return user


def create_anonymous_username() -> str:
    """Generate a readable anonymous handle like 'Warrior_47'."""
    adj = random.choice(_ADJECTIVES)
    noun = random.choice(_NOUNS)
    suffix = random.randint(1, 99)
    base = f"{adj}_{noun}_{suffix}"
    return re.sub(r"[^A-Za-z0-9_]+", "_", base)


def hash_email(email: str) -> str:
    """Hash an email address (sha256 hex) for recovery storage."""
    if not email or not str(email).strip():
        raise ValueError("email must not be empty")
    normalized = str(email).strip().lower()
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

