"""Journal entry payloads."""

from __future__ import annotations

from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class JournalEntryCreate(BaseModel):
    """Create a journal entry (plaintext is encrypted server-side)."""

    content: str = Field(..., min_length=1, max_length=100_000)


class JournalEntryResponse(BaseModel):
    """Journal entry returned to the owner with decrypted content."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    content: str
    content_hash: str
    created_at: datetime
    updated_at: datetime


class JournalEntryList(BaseModel):
    """Envelope for listing journal entries."""

    entries: List[JournalEntryResponse]
