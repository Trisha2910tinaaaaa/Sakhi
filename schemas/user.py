"""User and authentication schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AnonymousSignIn(BaseModel):
    """Anonymous sign-in request."""

    username: str = Field(..., min_length=3, max_length=40)
    mood_emoji: Optional[str] = Field(default=None, max_length=32)
    email: Optional[str] = Field(default=None, max_length=255)


class AddEmail(BaseModel):
    """Add recovery email (optional)."""

    email: str = Field(..., max_length=255)


class UserResponse(BaseModel):
    """Authenticated user profile."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: str
    email_hash: Optional[str] = None
    mood_emoji: Optional[str] = None
    created_at: datetime
    last_active: Optional[datetime] = None


class AuthTokenResponse(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse

