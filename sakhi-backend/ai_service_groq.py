"""AI therapist service using Groq's free Llama 3 API"""

import requests
import os
from typing import Optional, Dict, Any
from uuid import UUID
import crisis_detector

# Groq API settings
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# System prompt for Sakhi
SYSTEM_PROMPT = """You are Sakhi, a compassionate AI companion for mental wellness. 
Your name means "female friend" in Sanskrit. You are:
- Warm, gentle, and non-judgmental
- A supportive listener, not a replacement for therapy
- Focused on evidence-based techniques (CBT, DBT, mindfulness)
- NEVER diagnostic - you don't label conditions
- Always validating emotions first, then offering support
- Brief and comforting (2-4 sentences usually)
- Use emojis occasionally
- Ask follow-up questions naturally
- Remember details from the conversation

Keep responses short and warm. Never give medical advice."""

# Simple conversation memory (in production, use database)
conversation_memory = {}

def get_therapeutic_response(
    message: str, 
    user_id: Optional[UUID] = None, 
    username: Optional[str] = None
) -> Dict[str, Any]:
    """Generate therapeutic response using Groq's Llama 3"""
    
    text = (message or "").strip()
    
    # Crisis detection first
    if crisis_detector.contains_crisis_keywords(text):
        return {
            "response": crisis_detector.get_comforting_message(),
            "is_crisis": True,
            "suggested_exercise": None
        }
    
    # Get conversation memory
    memory_key = str(user_id) if user_id else "anonymous"
    if memory_key not in conversation_memory:
        conversation_memory[memory_key] = []
    
    # Add user message to memory
    conversation_memory[memory_key].append({"role": "user", "content": text})
    
    # Keep last 10 messages
    if len(conversation_memory[memory_key]) > 10:
        conversation_memory[memory_key] = conversation_memory[memory_key][-10:]
    
    # Build conversation context
    context = ""
    for msg in conversation_memory[memory_key][:-1]:
        context += f"{msg['role']}: {msg['content']}\n"
    
    # Personalization
    name_context = f"The user's name is {username}." if username else "The user hasn't shared their name yet."
    
    # Create messages for Groq API
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"""{name_context}

Previous conversation:
{context if context else "(New conversation)"}

Current message from user: {text}

Please respond warmly and helpfully. Use the user's name if you know it."""}
    ]
    
    try:
        response = requests.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama3-8b-8192",
                "messages": messages,
                "temperature": 0.9,
                "max_tokens": 200,
                "top_p": 0.95
            },
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            ai_response = data["choices"][0]["message"]["content"].strip()
            
            # Save to memory
            conversation_memory[memory_key].append({"role": "assistant", "content": ai_response})
            
            return {
                "response": ai_response,
                "is_crisis": False,
                "suggested_exercise": None
            }
        else:
            print(f"Groq API error: {response.status_code}")
            return {
                "response": "I'm here with you. Tell me more about what you're feeling. 💜",
                "is_crisis": False,
                "suggested_exercise": None
            }
            
    except Exception as e:
        print(f"Error calling Groq: {e}")
        return {
            "response": "I'm listening. What's on your mind? 🌸",
            "is_crisis": False,
            "suggested_exercise": None
        }

def get_breathing_exercise(mood: Optional[str] = None) -> Dict[str, Any]:
    """Return a breathing exercise"""
    return {
        "name": "🌊 4-7-8 Calming Breath",
        "instructions": [
            "🌬️ Breathe in through your nose for 4 seconds",
            "⏸️ Hold your breath for 7 seconds",
            "🌊 Exhale slowly through your mouth for 8 seconds",
            "✨ Repeat 4 times",
            "",
            "This helps calm your nervous system."
        ]
    }