"""Therapist directory and booking lifecycle."""

from __future__ import annotations

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.deps import get_current_user
from database import get_db
from models import Booking, BookingStatus, Therapist, User
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


def _booking_to_response(booking: Booking) -> BookingResponse:
    """Build a booking DTO including therapist profile."""
    if booking.therapist is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Booking is missing therapist relation",
        )
    return BookingResponse(
        id=booking.id,
        therapist_id=booking.therapist_id,
        scheduled_at=booking.scheduled_at,
        status=booking.status,
        notes=booking.notes,
        created_at=booking.created_at,
        therapist=TherapistResponse.model_validate(booking.therapist),
    )


@router.get("", response_model=TherapistListResponse)
def list_therapists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TherapistListResponse:
    """List available therapists."""
    _ = current_user
    try:
        rows = db.query(Therapist).order_by(Therapist.name.asc()).all()
        return TherapistListResponse(
            therapists=[TherapistResponse.model_validate(t) for t in rows]
        )
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
    """Return one therapist by id."""
    _ = current_user
    try:
        t = db.query(Therapist).filter(Therapist.id == therapist_id).first()
        if t is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Therapist not found")
        return TherapistResponse.model_validate(t)
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
    """Create a booking with a therapist."""
    try:
        t = db.query(Therapist).filter(Therapist.id == therapist_id).first()
        if t is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Therapist not found")
        booking = Booking(
            user_id=current_user.id,
            therapist_id=therapist_id,
            scheduled_at=body.scheduled_at,
            notes=body.notes,
            status=BookingStatus.pending,
        )
        db.add(booking)
        db.commit()
        db.refresh(booking)
        booking = (
            db.query(Booking)
            .options(joinedload(Booking.therapist))
            .filter(Booking.id == booking.id)
            .first()
        )
        if booking is None:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Booking failed")
        return _booking_to_response(booking)
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
        rows = (
            db.query(Booking)
            .options(joinedload(Booking.therapist))
            .filter(Booking.user_id == current_user.id)
            .order_by(Booking.scheduled_at.desc())
            .all()
        )
        return BookingListResponse(bookings=[_booking_to_response(b) for b in rows])
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("list_bookings failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load bookings",
        ) from exc


@bookings_router.post("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BookingResponse:
    """Mark a booking as cancelled if it belongs to the current user."""
    try:
        booking = (
            db.query(Booking)
            .options(joinedload(Booking.therapist))
            .filter(Booking.id == booking_id, Booking.user_id == current_user.id)
            .first()
        )
        if booking is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        booking.status = BookingStatus.cancelled
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return _booking_to_response(booking)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("cancel_booking failed")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to cancel booking",
        ) from exc
