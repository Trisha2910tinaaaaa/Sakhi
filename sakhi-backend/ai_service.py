"""Mock therapeutic responses and breathing exercise payloads."""

from __future__ import annotations

from typing import Any, Dict, Optional
from uuid import UUID

import crisis_detector


def get_therapeutic_response(message: str, user_id: Optional[UUID] = None) -> Dict[str, Any]:
    """
    Produce a structured therapeutic-style response using lightweight keyword rules.

    Always runs crisis detection first. If crisis keywords match, the response prioritizes
    safety-oriented guidance and suggested breathing exercises.

    Args:
        message: User chat text.
        user_id: Optional authenticated user id for future personalization.

    Returns:
        Dict with keys response (str), is_crisis (bool), suggested_exercise (dict).
    """
    _ = user_id
    text = (message or "").strip()
    is_crisis = crisis_detector.contains_crisis_keywords(text)

    if is_crisis:
        exercise = get_breathing_exercise(mood="calm")
        return {
            "response": crisis_detector.get_comforting_message(),
            "is_crisis": True,
            "suggested_exercise": exercise,
        }

    lowered = text.lower()
    exercise = get_breathing_exercise(_infer_mood(lowered))

    if "anxious" in lowered or "anxiety" in lowered:
        return {
            "response": (
                "It makes sense that anxiety can feel overwhelming in your body and thoughts. "
                "Try naming one thing you can see and one you can hear right now to anchor yourself. "
                "You are not forever stuck in this feeling—small steps still count."
            ),
            "is_crisis": False,
            "suggested_exercise": exercise,
        }

    if "sad" in lowered or "depressed" in lowered or "down" in lowered:
        return {
            "response": (
                "Sadness can take up a lot of space, and it still does not define your whole story. "
                "If it helps, place a hand on your chest and take one slow breath with self-kindness. "
                "Reaching out here is already a brave act."
            ),
            "is_crisis": False,
            "suggested_exercise": exercise,
        }

    if "stress" in lowered or "stressed" in lowered:
        return {
            "response": (
                "Stress often piles up when too many demands hit at once. "
                "Consider one tiny action that would lower pressure by just five percent—water, a stretch, or a boundary. "
                "You deserve support while you carry a lot."
            ),
            "is_crisis": False,
            "suggested_exercise": exercise,
        }

    return {
        "response": (
            "Thank you for sharing with Sakhi. Whatever you are holding, your feelings are valid, "
            "and you do not have to process them alone. What part of your experience feels most important to talk about next?"
        ),
        "is_crisis": False,
        "suggested_exercise": exercise,
    }


def _infer_mood(lowered_text: str) -> Optional[str]:
    """Map rough keywords to a mood label for breathing exercise selection."""
    if "anxious" in lowered_text or "anxiety" in lowered_text:
        return "anxious"
    if "sad" in lowered_text or "down" in lowered_text:
        return "sad"
    if "stress" in lowered_text or "stressed" in lowered_text:
        return "stressed"
    return None


def get_breathing_exercise(mood: Optional[str] = None) -> Dict[str, Any]:
    """
    Return a structured breathing exercise with timing and a simple visual number guide.

    Uses 4-7-8 breathing when mood suggests anxiety or sadness; otherwise box breathing.
    """
    m = (mood or "").lower() if mood else ""
    if m in {"anxious", "sad", "stressed"}:
        return {
            "name": "4-7-8 breathing",
            "description": "Inhale 4, hold 7, exhale 8—calms the nervous system for many people.",
            "pattern": {
                "inhale_seconds": 4,
                "hold_after_inhale_seconds": 7,
                "exhale_seconds": 8,
                "cycles_recommended": 4,
            },
            "visual_guide": {
                "pattern": [4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8],
                "labels": [
                    "inhale",
                    "hold",
                    "exhale",
                    "inhale",
                    "hold",
                    "exhale",
                    "inhale",
                    "hold",
                    "exhale",
                    "inhale",
                    "hold",
                    "exhale",
                ],
            },
        }
    return {
        "name": "Box breathing",
        "description": "Equal counts for inhale, hold, exhale, hold—simple and steadying.",
        "pattern": {
            "inhale_seconds": 4,
            "hold_after_inhale_seconds": 4,
            "exhale_seconds": 4,
            "hold_after_exhale_seconds": 4,
            "cycles_recommended": 4,
        },
        "visual_guide": {
            "pattern": [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
            "labels": [
                "inhale",
                "hold",
                "exhale",
                "hold",
                "inhale",
                "hold",
                "exhale",
                "hold",
                "inhale",
                "hold",
                "exhale",
                "hold",
                "inhale",
                "hold",
                "exhale",
                "hold",
            ],
        },
    }
