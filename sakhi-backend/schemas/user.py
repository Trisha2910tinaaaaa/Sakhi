"""User and authentication-related schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AnonymousSignIn(BaseModel):
    """Optional client metadata for anonymous sign-in (reserved for future use)."""

    client_label: Optional[str] = Field(default=None, max_length=120)


class AddRecovery(BaseModel):
    """Set or rotate a recovery password while authenticated."""

    recovery_password: str = Field(..., min_length=8, max_length=256)


class RecoverAccount(BaseModel):
    """Recover access using public username and recovery password."""

    username: str = Field(..., min_length=1, max_length=120)
    recovery_password: str = Field(..., min_length=1, max_length=256)


class UserResponse(BaseModel):
    """Safe user projection for API consumers."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: str
    has_recovery_password: bool
    created_at: datetime


class AuthTokenResponse(BaseModel):
    """Bearer token issued after sign-in or recovery."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
