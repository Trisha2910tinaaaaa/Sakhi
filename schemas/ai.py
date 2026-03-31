"""AI request/response schemas."""

from __future__ import annotations

from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """User message payload for /api/ai/chat."""

    message: str = Field(..., min_length=1, max_length=20_000)
    # Token already implies identity; we accept this optionally and validate match.
    user_id: Optional[UUID] = None


class ChatResponse(BaseModel):
    """Assistant reply with crisis flag and optional exercise."""

    response: str
    is_crisis: bool
    suggested_exercise: Optional[Dict[str, Any]] = None
    crisis_resources: Optional[Dict[str, Any]] = None


class BreathingExerciseResponse(BaseModel):
    """Breathing exercise payload returned by /api/ai/breathing-exercise."""

    exercise: Dict[str, Any]
    mood: Optional[str] = None
