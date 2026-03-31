"""Therapist directory and booking schemas."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TherapistResponse(BaseModel):
    """Public therapist profile."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    title: Optional[str] = None
    specialty: Optional[str] = None
    bio: Optional[str] = None
    image_url: Optional[str] = None
    verified: bool = False
    created_at: datetime


class BookingCreate(BaseModel):
    """Request body when booking a therapist."""

    session_date: datetime = Field(..., description="ISO-8601 datetime in UTC or with offset")
    notes: Optional[str] = Field(default=None, max_length=4000)


class BookingResponse(BaseModel):
    """Booking projection including therapist summary."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    therapist_id: UUID
    session_date: datetime
    status: str
    notes: Optional[str] = None
    created_at: datetime
    therapist: TherapistResponse


class BookingListResponse(BaseModel):
    """List bookings for the authenticated user."""

    bookings: List[BookingResponse]


class TherapistListResponse(BaseModel):
    """List therapists."""

    therapists: List[TherapistResponse]
