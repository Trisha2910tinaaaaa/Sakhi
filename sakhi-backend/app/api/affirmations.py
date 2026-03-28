"""Affirmation catalog, random picks, and saved affirmations."""

from __future__ import annotations

import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.deps import get_current_user
from database import get_db
from models import Affirmation, SavedAffirmation, User
from schemas.affirmation import AffirmationResponse, SaveAffirmation, SavedAffirmationList

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/affirmations", tags=["affirmations"])


@router.get("/random", response_model=AffirmationResponse)
def random_affirmation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AffirmationResponse:
    """Return a random affirmation from the catalog."""
    _ = current_user
    try:
        row = db.query(Affirmation).order_by(func.random()).first()
        if row is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No affirmations available; run seed_affirmations",
            )
        return AffirmationResponse.model_validate(row)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("random_affirmation failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to pick affirmation",
        ) from exc


@router.get("/saved", response_model=SavedAffirmationList)
def list_saved(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SavedAffirmationList:
    """List affirmations the user has saved."""
    try:
        q = (
            db.query(Affirmation)
            .join(SavedAffirmation, SavedAffirmation.affirmation_id == Affirmation.id)
            .filter(SavedAffirmation.user_id == current_user.id)
            .order_by(SavedAffirmation.saved_at.desc())
        )
        items = [AffirmationResponse.model_validate(r) for r in q.all()]
        return SavedAffirmationList(affirmations=items)
    except Exception as exc:
        logger.exception("list_saved failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to list saved affirmations",
        ) from exc


@router.post("/{affirmation_id}/save", status_code=status.HTTP_200_OK)
def save_affirmation(
    affirmation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    _body: Optional[SaveAffirmation] = Body(default=None),
) -> dict:
    """Save an affirmation for the current user (idempotent)."""
    _ = _body
    try:
        aff = db.query(Affirmation).filter(Affirmation.id == affirmation_id).first()
        if aff is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Affirmation not found")
        exists = (
            db.query(SavedAffirmation)
            .filter(
                SavedAffirmation.user_id == current_user.id,
                SavedAffirmation.affirmation_id == affirmation_id,
            )
            .first()
        )
        if exists is None:
            db.add(SavedAffirmation(user_id=current_user.id, affirmation_id=affirmation_id))
            db.commit()
            message = "Saved"
        else:
            message = "Already saved"
        return {"status": "ok", "message": message}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("save_affirmation failed")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save affirmation",
        ) from exc


@router.delete("/{affirmation_id}/unsave", status_code=status.HTTP_200_OK)
def unsave_affirmation(
    affirmation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Remove a saved affirmation for the current user."""
    try:
        row = (
            db.query(SavedAffirmation)
            .filter(
                SavedAffirmation.user_id == current_user.id,
                SavedAffirmation.affirmation_id == affirmation_id,
            )
            .first()
        )
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved affirmation not found")
        db.delete(row)
        db.commit()
        return {"status": "ok", "message": "Removed from saved"}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("unsave_affirmation failed")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to unsave affirmation",
        ) from exc
