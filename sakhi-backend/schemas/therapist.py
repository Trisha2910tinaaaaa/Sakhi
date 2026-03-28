"""Therapist directory and booking schemas."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from models import BookingStatus


class TherapistResponse(BaseModel):
    """Public therapist profile."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    title: Optional[str]
    specialty: Optional[str]
    bio: Optional[str]
    image_url: Optional[str]
    created_at: datetime


class BookingCreate(BaseModel):
    """Request body when booking a therapist (therapist id may also come from path)."""

    scheduled_at: datetime = Field(..., description="ISO-8601 datetime in UTC or with offset")
    notes: Optional[str] = Field(default=None, max_length=4000)


class BookingResponse(BaseModel):
    """Booking projection including therapist summary."""

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    id: UUID
    therapist_id: UUID
    scheduled_at: datetime
    status: BookingStatus
    notes: Optional[str]
    created_at: datetime
    therapist: TherapistResponse


class BookingListResponse(BaseModel):
    """List bookings for the authenticated user."""

    bookings: List[BookingResponse]


class TherapistListResponse(BaseModel):
    """List therapists."""

    therapists: List[TherapistResponse]
