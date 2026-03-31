"""Encrypted journal CRUD for the authenticated user."""

from __future__ import annotations

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import encryption_service
from app.deps import get_current_user
from database import get_db
from models import JournalEntry, User
from schemas.journal import JournalEntryCreate, JournalEntryList, JournalEntryResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/journal", tags=["journal"])


def _to_response(entry: JournalEntry) -> JournalEntryResponse:
    """Decrypt journal ciphertext for API responses."""
    try:
        encrypted_payload = entry.content_encrypted or entry.encrypted_content
        plain = encryption_service.decrypt_text(encrypted_payload)
    except ValueError as exc:
        logger.exception("Journal decrypt failed for %s", entry.id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to decrypt journal entry",
        ) from exc
    return JournalEntryResponse(
        id=entry.id,
        content=plain,
        content_hash=entry.content_hash,
        mood_emoji=entry.mood_emoji,
        created_at=entry.created_at,
        updated_at=entry.updated_at,
    )


@router.get("/entries", response_model=JournalEntryList)
def list_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JournalEntryList:
    """List all journal entries for the current user (decrypted)."""
    try:
        rows = (
            db.query(JournalEntry)
            .filter(JournalEntry.user_id == current_user.id)
            .order_by(JournalEntry.created_at.desc())
            .all()
        )
        return JournalEntryList(entries=[_to_response(e) for e in rows])
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("list_entries failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to list journal entries",
        ) from exc


@router.post("/entries", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
def create_entry(
    body: JournalEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JournalEntryResponse:
    """Create a journal entry; plaintext is hashed and encrypted before storage."""
    try:
        content_hash = encryption_service.generate_content_hash(body.content)
        encrypted = encryption_service.encrypt_text(body.content)
        mood_emoji = body.mood_emoji or current_user.mood_emoji
        entry = JournalEntry(
            user_id=current_user.id,
            encrypted_content=encrypted,  # legacy column
            content_encrypted=encrypted,  # spec column
            content_hash=content_hash,
            mood_emoji=mood_emoji,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return _to_response(entry)
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("create_entry failed")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create journal entry",
        ) from exc


@router.get("/entries/{entry_id}", response_model=JournalEntryResponse)
def get_entry(
    entry_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> JournalEntryResponse:
    """Retrieve a single journal entry by id (decrypted)."""
    try:
        entry = (
            db.query(JournalEntry)
            .filter(JournalEntry.id == entry_id, JournalEntry.user_id == current_user.id)
            .first()
        )
        if entry is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found")
        return _to_response(entry)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("get_entry failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load journal entry",
        ) from exc


@router.delete("/entries/{entry_id}", status_code=status.HTTP_200_OK)
def delete_entry(
    entry_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Delete a journal entry owned by the current user."""
    try:
        entry = (
            db.query(JournalEntry)
            .filter(JournalEntry.id == entry_id, JournalEntry.user_id == current_user.id)
            .first()
        )
        if entry is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journal entry not found")
        db.delete(entry)
        db.commit()
        return {"status": "ok", "deleted_id": str(entry_id)}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("delete_entry failed")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to delete journal entry",
        ) from exc
