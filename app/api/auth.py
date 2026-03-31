"""Authentication endpoints for Sakhi."""

from __future__ import annotations

import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.deps import get_current_user
from auth_service import create_anonymous_username, create_jwt_token, hash_email
from database import get_db
from models import User
from schemas.user import AddEmail, AnonymousSignIn, AuthTokenResponse, UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_response(user: User) -> UserResponse:
    """Map ORM user to API response."""
    return UserResponse(
        id=user.id,
        username=user.username,
        email_hash=user.email_hash,
        mood_emoji=user.mood_emoji,
        created_at=user.created_at,
        last_active=user.last_active,
    )


@router.post("/signin", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def signin(body: AnonymousSignIn, db: Session = Depends(get_db)) -> AuthTokenResponse:
    """Create an anonymous user and return a JWT.

    Client stores token in localStorage as `sakhi_token`.
    """
    try:
        username = body.username.strip()
        if not username:
            username = create_anonymous_username()

        # Upsert by username (unique).
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            user = User(username=username, mood_emoji=body.mood_emoji)
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            if body.mood_emoji is not None:
                user.mood_emoji = body.mood_emoji
            db.add(user)
            db.commit()
            db.refresh(user)

        user.last_active = datetime.now(timezone.utc)
        db.add(user)
        db.commit()
        db.refresh(user)

        if body.email:
            user.email_hash = hash_email(body.email)
            db.add(user)
            db.commit()
            db.refresh(user)

        token = create_jwt_token(user)
        return AuthTokenResponse(access_token=token, user=_user_response(user))
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("signin failed")
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to sign in") from exc


@router.post("/add-email", status_code=status.HTTP_200_OK)
def add_email(
    body: AddEmail,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Add/replace recovery email for the authenticated user."""
    try:
        current_user.email_hash = hash_email(body.email)
        current_user.last_active = datetime.now(timezone.utc)
        db.add(current_user)
        db.commit()
        return {"status": "ok"}
    except Exception as exc:
        logger.exception("add_email failed")
        db.rollback()
        raise HTTPException(status_code=500, detail="Unable to save email") from exc


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Return the authenticated user's profile + preferences."""
    try:
        return _user_response(current_user)
    except Exception as exc:
        logger.exception("me failed")
        raise HTTPException(status_code=500, detail="Unable to load profile") from exc

