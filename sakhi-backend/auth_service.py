"""JWT authentication, anonymous identity helpers, and recovery-password hashing."""

from __future__ import annotations

import os
import random
import re
from datetime import datetime, timedelta, timezone
from typing import Any, Dict
from uuid import UUID

from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from models import User

load_dotenv()

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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


def create_jwt_token(user_id: UUID) -> str:
    """
    Issue a signed JWT for the given user id.

    The subject claim carries the user id as a string; expiration is set from settings.
    """
    if not JWT_SECRET or not str(JWT_SECRET).strip():
        raise ValueError("JWT_SECRET must be set to create tokens")
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_jwt_token(token: str) -> Dict[str, Any]:
    """
    Validate a JWT and return its payload dictionary.

    Raises JWTError if the token is missing, expired, or invalid.
    """
    if not JWT_SECRET or not str(JWT_SECRET).strip():
        raise ValueError("JWT_SECRET must be set to verify tokens")
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


def get_current_user(token: str, db: Session) -> User:
    """
    Resolve a bearer token to a persisted User row.

    Raises JWTError if the token is invalid or user id is missing.
    Raises ValueError if the user no longer exists.
    """
    payload = verify_jwt_token(token)
    sub = payload.get("sub")
    if not sub:
        raise JWTError("Token missing subject")
    try:
        uid = UUID(str(sub))
    except ValueError as exc:
        raise JWTError("Invalid subject in token") from exc
    user = db.query(User).filter(User.id == uid).first()
    if user is None:
        raise ValueError("User not found for token")
    return user


def create_anonymous_username() -> str:
    """
    Generate a readable anonymous handle like 'Warrior_47' or 'Healing_Soul_92'.

    Ensures only alphanumeric segments and underscores for URL-safe display.
    """
    adj = random.choice(_ADJECTIVES)
    noun = random.choice(_NOUNS)
    suffix = random.randint(1, 99)
    base = f"{adj}_{noun}_{suffix}"
    return re.sub(r"[^A-Za-z0-9_]+", "_", base)


def hash_recovery_password(password: str) -> str:
    """Hash a recovery password using bcrypt for secure offline verification."""
    if not password or not str(password).strip():
        raise ValueError("recovery password must not be empty")
    return _pwd_context.hash(password)


def verify_recovery_password(plain: str, hashed: str) -> bool:
    """Verify a recovery password against a bcrypt hash."""
    if plain is None or hashed is None:
        return False
    try:
        return _pwd_context.verify(plain, hashed)
    except ValueError:
        return False
