"""SQLAlchemy ORM models for Sakhi.

These models map to the Supabase tables used by the Sakhi FastAPI backend.
We keep some legacy columns (like `body` alongside `content`) to support
existing data in your current Supabase instance.
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"


class AffirmationCategory(str, enum.Enum):
    self_love = "self_love"
    strength = "strength"
    calm = "calm"
    hope = "hope"
    resilience = "resilience"


class User(Base):
    """Sakhi user (anonymous first, optional recovery email)."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    username: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    recovery_password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Required by spec (schema_ensure adds these columns on startup).
    email_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mood_emoji: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_active: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    journal_entries: Mapped[List["JournalEntry"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    posts: Mapped[List["CommunityPost"]] = relationship(
        back_populates="author", cascade="all, delete-orphan"
    )
    comments: Mapped[List["Comment"]] = relationship(
        back_populates="author", cascade="all, delete-orphan"
    )
    post_upvotes: Mapped[List["PostUpvote"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    saved_affirmations: Mapped[List["SavedAffirmation"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    bookings: Mapped[List["TherapistBooking"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class JournalEntry(Base):
    """Encrypted journal entry (encrypted at rest)."""

    __tablename__ = "journal_entries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    # Legacy column (already present in your DB).
    encrypted_content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)

    # Required by spec (schema_ensure adds these columns on startup).
    content_encrypted: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    mood_emoji: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="journal_entries")


class CommunityPost(Base):
    """Community post (supports content/category/upvotes)."""

    __tablename__ = "community_posts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)

    # Legacy column.
    body: Mapped[str] = mapped_column(Text, nullable=False)

    # Required by spec.
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(64), nullable=False, default="daily")
    upvotes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    author: Mapped["User"] = relationship(back_populates="posts")
    upvote_records: Mapped[List["PostUpvote"]] = relationship(
        back_populates="post", cascade="all, delete-orphan"
    )
    comments: Mapped[List["Comment"]] = relationship(
        back_populates="post", cascade="all, delete-orphan"
    )


class PostUpvote(Base):
    """One upvote per user per post (idempotent + supports toggling)."""

    __tablename__ = "post_upvotes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("community_posts.id", ondelete="CASCADE"), index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="post_upvotes")
    post: Mapped["CommunityPost"] = relationship(back_populates="upvote_records")

    __table_args__ = (UniqueConstraint("user_id", "post_id", name="uq_post_upvote_user_post"),)


class Comment(Base):
    """Comment on a community post (required table name `comments`)."""

    __tablename__ = "comments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("community_posts.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    post: Mapped["CommunityPost"] = relationship(back_populates="comments")
    author: Mapped["User"] = relationship(back_populates="comments")


class Affirmation(Base):
    """Catalog affirmation text."""

    __tablename__ = "affirmations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[AffirmationCategory] = mapped_column(
        Enum(AffirmationCategory, name="affirmation_category"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SavedAffirmation(Base):
    """User-saved affirmation join table."""

    __tablename__ = "saved_affirmations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    affirmation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("affirmations.id", ondelete="CASCADE"), index=True
    )
    saved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="saved_affirmations")
    affirmation: Mapped["Affirmation"] = relationship()

    __table_args__ = (
        UniqueConstraint("user_id", "affirmation_id", name="uq_saved_affirmation_user_aff"),
    )


class Therapist(Base):
    """Therapist profile for bookings."""

    __tablename__ = "therapists"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    specialty: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Required by spec (schema_ensure adds this column).
    verified: Mapped[bool] = mapped_column(
        # Boolean column exists after schema_ensure; mapped_column picks it up.
        # We keep it non-null with default false.
        # Note: SQLAlchemy will infer the correct type from bool.
        nullable=False,
        default=False,
    )

    bookings: Mapped[List["TherapistBooking"]] = relationship(back_populates="therapist")


class TherapistBooking(Base):
    """Therapist booking (required table name `therapist_bookings`)."""

    __tablename__ = "therapist_bookings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    therapist_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("therapists.id", ondelete="CASCADE"), index=True
    )
    session_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    # `therapist_bookings.status` is created as varchar by `schema_ensure.py`.
    # Using a plain string mapping avoids Postgres enum-type mismatches.
    status: Mapped[str] = mapped_column(String(32), nullable=False, default=BookingStatus.pending.value)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="bookings")
    therapist: Mapped["Therapist"] = relationship(back_populates="bookings")

