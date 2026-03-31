"""Crisis detection and crisis resources.

This module is used on every AI chat request to decide whether the user may
be expressing imminent self-harm / suicidal intent.
"""

from __future__ import annotations

import re
from typing import Any, Dict, FrozenSet


_CRISIS_KEYWORDS: FrozenSet[str] = frozenset(
    {
        "suicide",
        "kill myself",
        "end my life",
        "take my life",
        "want to die",
        "wish i were dead",
        "better off dead",
        "hopeless",
        "no reason to live",
        "life is meaningless",
        "i want to die",
        "i wanna die",
        "end it all",
        "can't go on",
        "cannot go on",
        "self harm",
        "self-harm",
        "hurt myself",
        "harm myself",
        "cut myself",
        "cutting myself",
        "overdose",
        "hang myself",
        "poison myself",
        "stab myself",
        "i'm going to kill myself",
        "im going to kill myself",
        "i am going to kill myself",
        "i am going to end my life",
        "i am going to hurt myself",
        "i want to end it",
        "i want to end things",
    }
)


def _normalize(text: str) -> str:
    lowered = (text or "").lower()
    lowered = re.sub(r"\s+", " ", lowered).strip()
    return lowered


def contains_crisis_keywords(text: str) -> bool:
    """Return True if the message matches crisis phrases."""
    if not text or not str(text).strip():
        return False
    normalized = _normalize(str(text))
    return any(phrase in normalized for phrase in _CRISIS_KEYWORDS)


def get_crisis_resources() -> Dict[str, Any]:
    """Return helpline resources required by the Sakhi spec."""
    return {
        "helplines": [
            {
                "label": "988 Suicide & Crisis Lifeline",
                "number": "988",
                "availability": "24/7",
                "url": "https://988lifeline.org/",
            },
            {
                "label": "Crisis Text Line",
                "number": "741741",
                "availability": "24/7",
                "url": "https://www.crisistextline.org/",
            },
            {
                "label": "Emergency Services",
                "number": "911",
                "availability": "Immediate danger",
                "url": "https://www.usa.gov/emergency",
            },
        ]
    }


def get_comforting_message() -> str:
    """A warm, non-robotic message to accompany crisis resources."""
    return (
        "I am really sorry you are feeling this way. "
        "If you are in immediate danger or might act on these thoughts, please call 911 right now. "
        "If you are in the US, you can also call or text 988, or text HOME to 741741 (Crisis Text Line). "
        "You deserve support and you do not have to handle this alone."
    )
