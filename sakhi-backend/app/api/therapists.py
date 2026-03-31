"""Therapists directory and booking endpoints."""

from __future__ import annotations

import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.deps import get_current_user
from database import get_db
from models import Therapist, TherapistBooking, BookingStatus, User
from schemas.therapist import (
    BookingCreate,
    BookingListResponse,
    BookingResponse,
    TherapistListResponse,
    TherapistResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/therapists", tags=["therapists"])
bookings_router = APIRouter(prefix="/bookings", tags=["bookings"])


def _therapist_response(t: Therapist) -> TherapistResponse:
    return TherapistResponse.model_validate(t)


def _booking_response(b: TherapistBooking) -> BookingResponse:
    return BookingResponse(
        id=b.id,
        therapist_id=b.therapist_id,
        session_date=b.session_date,
        status=b.status.value if hasattr(b.status, "value") else str(b.status),
        notes=b.notes,
        created_at=b.created_at,
        therapist=_therapist_response(b.therapist),
    )


@router.get("", response_model=TherapistListResponse)
def list_therapists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    verified: Optional[bool] = Query(default=True),
    specialty: Optional[str] = Query(default=None, max_length=200),
) -> TherapistListResponse:
    """List verified therapists with optional filters."""
    _ = current_user  # reserved for future personalization
    try:
        q = db.query(Therapist)
        if verified is not None:
            q = q.filter(Therapist.verified == verified)
        if specialty:
            q = q.filter(Therapist.specialty.ilike(f"%{specialty.strip()}%"))
        rows: List[Therapist] = q.order_by(Therapist.created_at.desc()).all()
        return TherapistListResponse(therapists=[_therapist_response(t) for t in rows])
    except Exception as exc:
        logger.exception("list_therapists failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load therapists",
        ) from exc


@router.get("/{therapist_id}", response_model=TherapistResponse)
def get_therapist(
    therapist_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TherapistResponse:
    """Get a single therapist by id."""
    _ = current_user
    try:
        row = db.query(Therapist).filter(Therapist.id == therapist_id).first()
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Therapist not found")
        return _therapist_response(row)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("get_therapist failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load therapist",
        ) from exc


@router.post("/{therapist_id}/book", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def book_therapist(
    therapist_id: UUID,
    body: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BookingResponse:
    """Create a booking for the authenticated user."""
    try:
        t = db.query(Therapist).filter(Therapist.id == therapist_id).first()
        if t is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Therapist not found")

        booking = TherapistBooking(
            user_id=current_user.id,
            therapist_id=therapist_id,
            session_date=body.session_date,
            notes=body.notes,
            status=BookingStatus.pending.value,
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)

        # Load therapist relation for response.
        booking = (
            db.query(TherapistBooking)
            .filter(TherapistBooking.id == booking.id)
            .first()
        )
        if booking is None or booking.therapist is None:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Booking failed")

        return _booking_response(booking)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("book_therapist failed")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create booking",
        ) from exc


@bookings_router.get("", response_model=BookingListResponse)
def list_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BookingListResponse:
    """List bookings for the authenticated user."""
    try:
        rows: List[TherapistBooking] = (
            db.query(TherapistBooking)
            .filter(TherapistBooking.user_id == current_user.id)
            .order_by(TherapistBooking.session_date.desc())
            .all()
        )
        return BookingListResponse(bookings=[_booking_response(b) for b in rows])
    except Exception as exc:
        logger.exception("list_bookings failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load bookings",
        ) from exc

