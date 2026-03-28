"""Affirmation and save-toggle schemas."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from models import AffirmationCategory


class AffirmationResponse(BaseModel):
    """Single affirmation record."""

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: UUID
    text: str
    category: AffirmationCategory
    created_at: datetime


class SaveAffirmation(BaseModel):
    """Optional note when saving (unused)."""

    note: Optional[str] = Field(default=None, max_length=500)


class SavedAffirmationList(BaseModel):
    """Saved affirmations for the current user."""

    affirmations: List[AffirmationResponse]
