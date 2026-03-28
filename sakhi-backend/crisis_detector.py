"""Keyword-based crisis detection and static crisis-resource messaging."""

from __future__ import annotations

import re
from typing import Any, Dict

_CRISIS_KEYWORDS = frozenset(
    {
        "suicide",
        "kill myself",
        "end my life",
        "want to die",
        "better off dead",
        "self harm",
        "self-harm",
        "hurt myself",
        "cut myself",
        "no reason to live",
        "end it all",
        "can't go on",
        "cannot go on",
        "overdose",
        "hang myself",
    }
)


def contains_crisis_keywords(text: str) -> bool:
    """
    Return True if the normalized message matches known crisis phrases or keywords.

    Matching is case-insensitive; multi-word phrases are detected as substrings.
    """
    if not text or not str(text).strip():
        return False
    lowered = str(text).lower()
    normalized = re.sub(r"\s+", " ", lowered).strip()
    for phrase in _CRISIS_KEYWORDS:
        if phrase in normalized:
            return True
    return False


def get_crisis_resources() -> Dict[str, Any]:
    """
    Return structured helpline and safety resources for urgent mental health support.

    Values are suitable for direct JSON responses to clients.
    """
    return {
        "emergency": {
            "instruction": "If you or someone else is in immediate danger, call emergency services (911 in the US).",
            "helplines": [
                {
                    "name": "988 Suicide & Crisis Lifeline",
                    "number": "988",
                    "hours": "24/7",
                    "url": "https://988lifeline.org/",
                },
                {
                    "name": "Crisis Text Line",
                    "text_code": "741741",
                    "hours": "24/7",
                    "url": "https://www.crisistextline.org/",
                },
            ],
        },
        "additional": [
            {
                "name": "SAMHSA National Helpline",
                "number": "1-800-662-4357",
                "description": "Treatment referral and information (US).",
            }
        ],
    }


def get_comforting_message() -> str:
    """
    Return a short, grounding message when crisis language is detected.

    This is not a substitute for professional or emergency care.
    """
    return (
        "I am really glad you reached out. What you are feeling matters, and you do not have to go through this alone. "
        "If you are in immediate danger, please contact local emergency services. In the US you can call or text 988, "
        "or text HOME to 741741 for the Crisis Text Line, available 24/7."
    )
