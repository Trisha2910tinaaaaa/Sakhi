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
import json
from typing import Any, Dict, List, Optional
from uuid import UUID

import httpx

import crisis_detector


# Groq API settings
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")

# Simple in-memory conversation memory.
_MEMORY: Dict[str, List[Dict[str, str]]] = {}
_MEMORY_NAMES: Dict[str, str] = {}
_MEMORY_MAX_MESSAGES = 10


SYSTEM_PROMPT = """You are Sakhi, a compassionate AI companion for mental wellness.
Your name means "female friend" in Sanskrit.

Key traits:
- Warm, gentle, non-judgmental
- Validate emotions first before offering support
- NEVER diagnose mental health conditions
- Keep responses short (2-4 sentences, max 100 words)
- Use emojis occasionally (💜, 🌸, 🌊, ✨)
- Ask follow-up questions naturally
- Vary your responses - don't repeat the same phrases
- Remember the user's name and use it naturally
- If the user seems anxious, suggest grounding techniques
- Be conversational, not robotic

Example responses:
- "I hear you, [name]. That sounds really heavy. Would you like to share more? 💜"
- "It makes sense you'd feel that way. Let's take a breath together. 🌊"
- "Thank you for trusting me with this, [name]. You're not alone in this."

Never give medical advice. Never say you're a therapist. Be a warm friend."""


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
    """Extract user-provided names from chat messages."""
    if not text:
        return None
    t = str(text).strip()
    patterns = [
        r"my name is\s+(?P<name>[A-Za-z][A-Za-z\s\-']{0,40})",
        r"i['‘’]?m\s+(?P<name>[A-Za-z][A-Za-z\s\-']{0,40})",
        r"i am\s+(?P<name>[A-Za-z][A-Za-z\s\-']{0,40})",
        r"call me\s+(?P<name>[A-Za-z][A-Za-z\s\-']{0,40})",
    ]
    for pat in patterns:
        m = re.search(pat, t, flags=re.IGNORECASE)
        if m:
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
        if role and content:
            lines.append(f"{role}: {content}")
    return "\n".join(lines)


def _trim_response(text: str) -> str:
    """Keep output short."""
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
    """Return a breathing exercise."""
    m = (mood or "").lower() if mood else ""

    options = [
        {
            "name": "🌊 4-7-8 breathing",
            "description": "Inhale 4, hold 7, exhale 8 to calm your nervous system.",
            "pattern": {
                "inhale_seconds": 4,
                "hold_after_inhale_seconds": 7,
                "exhale_seconds": 8,
                "cycles_recommended": 4,
            },
            "visual_guide": {
                "pattern": [4, 7, 8] * 4,
                "labels": ["inhale", "hold", "exhale"] * 4,
            },
        },
        {
            "name": "📦 Box breathing",
            "description": "Equal counts - steady and grounding.",
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
    ]

    if m in {"anxious", "anxiety", "sad", "stressed", "stress"}:
        return random.choice(options)
    return options[1]


def _infer_suggested_exercise(message: str, is_crisis: bool) -> Optional[Dict[str, Any]]:
    if is_crisis:
        return get_breathing_exercise(mood="calm")

    lowered = (message or "").lower()
    if any(k in lowered for k in ["breath", "breathing", "inhale", "exhale", "calm down"]):
        return get_breathing_exercise(mood="calm")
    if any(k in lowered for k in ["anxious", "anxiety", "worried", "panic"]):
        return get_breathing_exercise(mood="anxious")
    if any(k in lowered for k in ["sad", "depressed", "hopeless", "down"]):
        return get_breathing_exercise(mood="sad")
    if any(k in lowered for k in ["stressed", "stress", "overwhelmed"]):
        return get_breathing_exercise(mood="stressed")
    return None


def _call_groq(messages: List[Dict[str, str]]) -> str:
    """Call Groq API and return the raw model text."""
    if not GROQ_API_KEY:
        print("❌ GROQ_API_KEY not set in environment variables")
        raise ValueError("GROQ_API_KEY not set in environment variables")
    
    payload = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": 0.85,
        "max_tokens": 250,
        "top_p": 0.95,
        "frequency_penalty": 0.5,
        "presence_penalty": 0.5,
    }
    
    timeout_seconds = 45
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    print(f"📤 Sending request to Groq with model: {GROQ_MODEL}")
    
    try:
        with httpx.Client(timeout=timeout_seconds) as client:
            resp = client.post(GROQ_URL, json=payload, headers=headers)
        
        print(f"📥 Groq response status: {resp.status_code}")
        
        if resp.status_code != 200:
            print(f"❌ Groq error response: {resp.text}")
            resp.raise_for_status()
        
        data = resp.json()
        response_text = data["choices"][0]["message"]["content"].strip()
        print(f"✅ Groq response received: {response_text[:100]}...")
        return response_text
        
    except httpx.TimeoutException:
        print("❌ Groq API timeout after 45 seconds")
        raise
    except httpx.HTTPStatusError as e:
        print(f"❌ Groq HTTP error: {e.response.status_code} - {e.response.text}")
        raise
    except Exception as e:
        print(f"❌ Groq API error: {e}")
        raise


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
        print(f"📝 Extracted name: {detected_name}")

    display_name = _get_display_name(user_id, username)
    
    history = _get_memory(user_id)
    
    # Build conversation context
    context_text = _format_history(history[-6:]) if history else "(New conversation)"
    
    # Create a single user message with all context (Groq works better with this format)
    user_content = f"""{SYSTEM_PROMPT}

User info: {"The user's name is " + display_name + ". Use their name naturally." if display_name else "The user hasn't shared their name yet. Ask gently if they'd like to share."}

Previous conversation:
{context_text}

Current message from user: {text}

Remember:
- Be warm and conversational
- Use the user's name if you know it
- Keep response to 2-4 sentences
- Be supportive but not robotic
- If appropriate, suggest a breathing or grounding exercise

Your response:"""

    messages = [
        {"role": "system", "content": "You are Sakhi, a warm, compassionate AI companion."},
        {"role": "user", "content": user_content}
    ]

    try:
        raw = _call_groq(messages)
        response = _trim_response(raw)
        print(f"💬 Generated response: {response[:100]}...")
        
    except Exception as e:
        print(f"❌ Groq API error: {e}")
        # Fallback response - personalized if possible
        if display_name:
            response = f"{display_name}, I'm here with you. Tell me more about what's on your mind. 💜"
        else:
            response = "I'm here with you. Tell me more about what's on your mind. 💜"

    # Ensure name is used if detected
    if detected_name and detected_name.lower() not in response.lower():
        response = f"Nice to meet you {detected_name}. {response}"
        response = _trim_response(response)

    suggested_exercise = _infer_suggested_exercise(text, is_crisis=False)

    # Update memory
    history.append({"role": "user", "content": text})
    history.append({"role": "assistant", "content": response})
    _set_memory(user_id, history)

    return {
        "response": response,
        "is_crisis": False,
        "suggested_exercise": suggested_exercise,
    }
