"""Authentication: anonymous access, recovery password, and session introspection."""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

import auth_service
from app.deps import get_current_user
from database import get_db
from models import User
from schemas.user import AddRecovery, AnonymousSignIn, AuthTokenResponse, RecoverAccount, UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_response(user: User) -> UserResponse:
    """Map ORM user to API-safe schema."""
    return UserResponse(
        id=user.id,
        username=user.username,
        has_recovery_password=bool(user.recovery_password_hash),
        created_at=user.created_at,
    )


@router.post("/anonymous-signin", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def anonymous_signin(
    db: Session = Depends(get_db),
    _payload: AnonymousSignIn = Body(default_factory=AnonymousSignIn),
) -> AuthTokenResponse:
    """
    Create a new anonymous user with a generated username and return a JWT.

    Does not require authentication. Optional JSON body may carry future metadata.
    """
    try:
        user: Optional[User] = None
        for _ in range(32):
            username = auth_service.create_anonymous_username()
            exists = db.query(User).filter(User.username == username).first()
            if not exists:
                user = User(username=username)
                db.add(user)
                db.commit()
                db.refresh(user)
                break
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not allocate a unique username",
            )
        token = auth_service.create_jwt_token(user.id)
        return AuthTokenResponse(access_token=token, user=_user_response(user))
    except HTTPException:
        raise
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("anonymous_signin failed")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create anonymous session",
        ) from exc


@router.post("/add-recovery", status_code=status.HTTP_200_OK)
def add_recovery(
    body: AddRecovery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Attach or update a recovery password on the authenticated account.
    """
    try:
        current_user.recovery_password_hash = auth_service.hash_recovery_password(body.recovery_password)
        db.add(current_user)
        db.commit()
        return {"status": "ok", "message": "Recovery password saved"}
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("add_recovery failed")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save recovery password",
        ) from exc


@router.post("/recover", response_model=AuthTokenResponse)
def recover_account(body: RecoverAccount, db: Session = Depends(get_db)) -> AuthTokenResponse:
    """
    Restore access with username and recovery password (public).

    Returns a new JWT when credentials match.
    """
    try:
        user = db.query(User).filter(User.username == body.username).first()
        if user is None or not user.recovery_password_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or recovery password",
            )
        if not auth_service.verify_recovery_password(body.recovery_password, user.recovery_password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or recovery password",
            )
        token = auth_service.create_jwt_token(user.id)
        return AuthTokenResponse(access_token=token, user=_user_response(user))
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("recover_account failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to recover account",
        ) from exc


@router.get("/me", response_model=UserResponse)
def read_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Return the authenticated user's profile."""
    try:
        return _user_response(current_user)
    except Exception as exc:
        logger.exception("read_me failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load profile",
        ) from exc
