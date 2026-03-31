"""AI therapist endpoints (real Ollama + crisis detection + memory)."""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel

import ai_service
import crisis_detector
from app.deps import get_current_user
from models import User
from schemas.ai import BreathingExerciseResponse, ChatRequest, ChatResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat", response_model=ChatResponse)
def chat(
    body: ChatRequest,
    db_user: User = Depends(get_current_user),
) -> ChatResponse:
    """
    Return a supportive (mock) reply; crisis keywords are evaluated on every request.

    Requires authentication so sessions can be attributed to a user id for auditing.
    """
    try:
        # Validate optional user_id if caller included it.
        if body.user_id is not None and body.user_id != db_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="user_id does not match authenticated token",
            )

        payload: Dict[str, Any] = ai_service.get_therapeutic_response(
            body.message,
            user_id=db_user.id,
            username=db_user.username,
        )
        return ChatResponse(
            response=payload["response"],
            is_crisis=payload["is_crisis"],
            suggested_exercise=payload.get("suggested_exercise"),
            crisis_resources=payload.get("crisis_resources"),
        )
    except Exception as exc:
        logger.exception("chat failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate chat response",
        ) from exc


class BreathingRequest(BaseModel):
    """Optional mood hint for breathing exercise selection."""

    mood: Optional[str] = None


@router.post("/breathing-exercise", response_model=BreathingExerciseResponse)
def breathing_exercise(
    body: BreathingRequest = Body(default_factory=BreathingRequest),
    _user: User = Depends(get_current_user),
) -> BreathingExerciseResponse:
    """Return a structured breathing exercise (authenticated)."""
    _ = _user
    try:
        mood = body.mood if body else None
        exercise = ai_service.get_breathing_exercise(mood)
        return BreathingExerciseResponse(exercise=exercise, mood=mood)
    except Exception as exc:
        logger.exception("breathing_exercise failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to build breathing exercise",
        ) from exc


@router.get("/crisis-resources")
def crisis_resources() -> dict:
    """
    Return static crisis resources (public, no authentication).

    Safe to call from marketing pages or logged-out flows.
    """
    try:
        return crisis_detector.get_crisis_resources()
    except Exception as exc:
        logger.exception("crisis_resources failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load crisis resources",
        ) from exc
