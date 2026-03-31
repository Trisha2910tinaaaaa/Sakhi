"""AI therapist service for Sakhi.

Implements:
- Real Groq Llama 3 integration (free API)
- Per-user conversation memory (last 5-10 messages)
- Personalization via user's name (and "My name is ..." extraction)
- Crisis detection before any model call
- Breathing exercise suggestions with a structured guide
"""

from __future__ import annotations

import os
import random
import re
from typing import Any, Dict, List, Optional
from uuid import UUID

import httpx

import crisis_detector


# Groq API settings
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")

# Simple in-memory conversation memory.
# Keyed by user_id (string). Works for single-process deployments.
_MEMORY: Dict[str, List[Dict[str, str]]] = {}
_MEMORY_NAMES: Dict[str, str] = {}  # last known display name extracted from messages
_MEMORY_MAX_MESSAGES = 10  # store last 5 user + 5 assistant messages


SYSTEM_PROMPT = (
    "You are Sakhi, a compassionate AI companion for mental wellness. "
    "You are warm, gentle, non-judgmental, and you validate emotions first. "
    "You NEVER diagnose or claim certainty about a mental health condition. "
    "You ask kind, short follow-up questions when helpful. "
    "If appropriate, you may suggest practical grounding or breathing exercises. "
    "Keep responses 2-4 sentences usually and never exceed 150 words. "
    "You sometimes validate, sometimes listen, sometimes ask questions, "
    "and sometimes suggest a small exercise. Vary your approach across turns. "
    "If the user appears to be in crisis, crisis resources will be handled separately. "
    "When you know the user's name, greet them naturally using that name. "
    "Use emojis occasionally to feel warm and human."
)


def _memory_key(user_id: Optional[UUID]) -> str:
    return str(user_id) if user_id else "anonymous"


def _get_memory(user_id: Optional[UUID]) -> List[Dict[str, str]]:
    return _MEMORY.get(_memory_key(user_id), [])


def _set_memory(user_id: Optional[UUID], history: List[Dict[str, str]]) -> None:
    _MEMORY[_memory_key(user_id)] = history[-_MEMORY_MAX_MESSAGES:]


def _get_display_name(user_id: Optional[UUID], username: Optional[str]) -> str:
    key = _memory_key(user_id)
    stored = _MEMORY_NAMES.get(key)
    if stored and stored.strip():
        return stored.strip()
    return (username or "").strip()


def _extract_name(text: str) -> Optional[str]:
    """Best-effort extraction of user-provided names from chat messages."""
    if not text:
        return None
    t = str(text).strip()
    patterns = [
        r"my name is\s+(?P<name>[A-Za-z][A-Za-z\s\-']{0,40})",
        r"i'm\s+(?P<name>[A-Za-z][A-Za-z\s\-']{0,40})",
        r"i am\s+(?P<name>[A-Za-z][A-Za-z\s\-']{0,40})",
        r"call me\s+(?P<name>[A-Za-z][A-Za-z\s\-']{0,40})",
    ]
    for pat in patterns:
        m = re.search(pat, t, flags=re.IGNORECASE)
        if not m:
            continue
        name = m.group("name").strip()
        name = re.sub(r"\s+", " ", name)
        if 1 <= len(name) <= 40:
            return name
    return None


def _format_history(history: List[Dict[str, str]]) -> str:
    lines: List[str] = []
    for msg in history:
        role = (msg.get("role") or "").upper()
        content = (msg.get("content") or "").strip()
        if not role or not content:
            continue
        lines.append(f"{role}: {content}")
    return "\n".join(lines)


def _trim_response(text: str) -> str:
    """Keep output short: 2-4 sentences and <=150 words."""
    t = (text or "").strip()
    sentences = re.split(r"(?<=[.!?])\s+", t)
    sentences = [s.strip() for s in sentences if s.strip()]
    if len(sentences) > 4:
        t = " ".join(sentences[:4])
    words = t.split()
    if len(words) > 150:
        t = " ".join(words[:150]).rstrip(".,;:!?") + "."
    return t


def get_breathing_exercise(mood: Optional[str] = None) -> Dict[str, Any]:
    """Return a breathing exercise with a visual number guide."""
    m = (mood or "").lower() if mood else ""

    options = [
        {
            "name": "🌊 4-7-8 breathing",
            "description": "Inhale 4, hold 7, exhale 8 to help calm your nervous system.",
            "pattern": {
                "inhale_seconds": 4,
                "hold_after_inhale_seconds": 7,
                "exhale_seconds": 8,
                "cycles_recommended": 4,
            },
            "visual_guide": {
                "pattern": [4, 7, 8, 4, 7, 8, 4, 7, 8, 4, 7, 8],
                "labels": ["inhale", "hold", "exhale"] * 4,
            },
        },
        {
            "name": "📦 Box breathing",
            "description": "Equal counts for inhale, hold, exhale, hold—steady and grounding.",
            "pattern": {
                "inhale_seconds": 4,
                "hold_after_inhale_seconds": 4,
                "exhale_seconds": 4,
                "hold_after_exhale_seconds": 4,
                "cycles_recommended": 4,
            },
            "visual_guide": {
                "pattern": [4, 4, 4, 4] * 4,
                "labels": ["inhale", "hold", "exhale", "hold"] * 4,
            },
        },
        {
            "name": "🧘 Box breathing (5 rounds)",
            "description": "Take it slow: 4 in, 4 hold, 4 out, 4 hold. Repeat 5 times.",
            "pattern": {
                "inhale_seconds": 4,
                "hold_after_inhale_seconds": 4,
                "exhale_seconds": 4,
                "hold_after_exhale_seconds": 4,
                "cycles_recommended": 5,
            },
            "visual_guide": {
                "pattern": [4, 4, 4, 4] * 5,
                "labels": ["inhale", "hold", "exhale", "hold"] * 5,
            },
        },
    ]

    if m in {"anxious", "anxiety", "sad", "stressed", "stress"}:
        return random.choice([options[0], options[1]])
    return random.choice(options[1:])


def _infer_suggested_exercise(message: str, is_crisis: bool) -> Optional[Dict[str, Any]]:
    if is_crisis:
        return get_breathing_exercise(mood="calm")

    lowered = (message or "").lower()
    wants_breath = any(k in lowered for k in ["breath", "breathing", "inhale", "exhale", "calm down"])
    anxious = any(k in lowered for k in ["anxious", "anxiety", "worried", "panic"])
    sad = any(k in lowered for k in ["sad", "depressed", "hopeless", "down"])
    stressed = any(k in lowered for k in ["stressed", "stress", "overwhelmed"])
    if wants_breath or anxious or sad or stressed:
        mood = "anxious" if anxious else "sad" if sad else "stressed" if stressed else None
        return get_breathing_exercise(mood=mood)
    return None


def _call_groq(messages: List[Dict[str, str]]) -> str:
    """Call Groq API and return the raw model text."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not set in environment variables")
    
    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": 0.9,
        "max_tokens": 200,
        "top_p": 0.95,
    }
    
    timeout_seconds = 30
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    with httpx.Client(timeout=timeout_seconds) as client:
        resp = client.post(GROQ_URL, json=payload, headers=headers)
    resp.raise_for_status()
    data = resp.json()
    return (data["choices"][0]["message"]["content"] or "").strip()


def get_therapeutic_response(
    message: str,
    user_id: Optional[UUID] = None,
    username: Optional[str] = None,
) -> Dict[str, Any]:
    """Return { response, is_crisis, suggested_exercise }."""
    text = (message or "").strip()
    is_crisis = crisis_detector.contains_crisis_keywords(text)

    if is_crisis:
        return {
            "response": crisis_detector.get_comforting_message(),
            "is_crisis": True,
            "suggested_exercise": get_breathing_exercise(mood="calm"),
            "crisis_resources": crisis_detector.get_crisis_resources(),
        }

    key = _memory_key(user_id)
    detected_name = _extract_name(text)
    if detected_name:
        _MEMORY_NAMES[key] = detected_name

    display_name = _get_display_name(user_id, username)
    if display_name:
        display_name_clause = f"The user's name is {display_name}. Use their name naturally when greeting them."
    else:
        display_name_clause = "The user's name is unknown. Ask gently what they'd like to be called."

    history = _get_memory(user_id)
    history_for_prompt = history[-9:]  # previous messages

    # Build conversation context for the system message
    context_text = _format_history(history_for_prompt) if history_for_prompt else "(New conversation)"
    
    # Create messages for Groq API
    messages = [
        {
            "role": "system",
            "content": f"{SYSTEM_PROMPT}\n\n{display_name_clause}"
        },
        {
            "role": "user",
            "content": f"Previous conversation:\n{context_text}\n\nCurrent message: {text}\n\nPlease respond warmly and helpfully."
        }
    ]

    try:
        raw = _call_groq(messages)
        response = _trim_response(raw)
    except Exception as e:
        print(f"Groq API error: {e}")
        # Warm non-mock fallback (still personalized when possible).
        if display_name and detected_name:
            response = (
                f"Nice to meet you {detected_name}. I'm here with you. "
                "Let's take one slow breath together, and then you can share what you're feeling."
            )
        elif display_name:
            response = (
                f"{display_name}, I'm here with you. Let's take one slow breath together, "
                "and then you can share what feels most heavy right now."
            )
        else:
            response = (
                "I'm here with you. Let's take one slow breath together, "
                "and then you can share what feels most heavy right now."
            )
        response = _trim_response(response)

    # If the user introduced their name, ensure the reply acknowledges it.
    if detected_name:
        if detected_name.lower() not in response.lower():
            response = f"Nice to meet you {detected_name}. {response}"
            response = _trim_response(response)

    suggested_exercise = _infer_suggested_exercise(text, is_crisis=False)

    # Update memory.
    history.append({"role": "user", "content": text})
    history.append({"role": "assistant", "content": response})
    _set_memory(user_id, history)

    return {
        "response": response,
        "is_crisis": False,
        "suggested_exercise": suggested_exercise,
    }