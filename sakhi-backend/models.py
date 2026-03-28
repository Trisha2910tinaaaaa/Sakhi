"""SQLAlchemy ORM models for the Sakhi mental wellness platform."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class BookingStatus(str, enum.Enum):
    """Lifecycle states for a therapist booking."""

    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"


class AffirmationCategory(str, enum.Enum):
    """Categories used to group affirmations."""

    self_love = "self_love"
    strength = "strength"
    calm = "calm"
    hope = "hope"
    resilience = "resilience"


class User(Base):
    """Anonymous-first user with optional recovery password."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    username: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    recovery_password_hash: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    journal_entries: Mapped[List["JournalEntry"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    posts: Mapped[List["CommunityPost"]] = relationship(
        back_populates="author", cascade="all, delete-orphan"
    )
    comments: Mapped[List["PostComment"]] = relationship(
        back_populates="author", cascade="all, delete-orphan"
    )
    post_upvotes: Mapped[List["PostUpvote"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    saved_affirmations: Mapped[List["SavedAffirmation"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    bookings: Mapped[List["Booking"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class JournalEntry(Base):
    """User journal entry with encrypted body at rest."""

    __tablename__ = "journal_entries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    encrypted_content: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="journal_entries")


class CommunityPost(Base):
    """Community discussion post."""

    __tablename__ = "community_posts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    author: Mapped["User"] = relationship(back_populates="posts")
    comments: Mapped[List["PostComment"]] = relationship(
        back_populates="post", cascade="all, delete-orphan"
    )
    upvotes: Mapped[List["PostUpvote"]] = relationship(
        back_populates="post", cascade="all, delete-orphan"
    )


class PostUpvote(Base):
    """One upvote per user per post."""

    __tablename__ = "post_upvotes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("community_posts.id", ondelete="CASCADE"), index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="post_upvotes")
    post: Mapped["CommunityPost"] = relationship(back_populates="upvotes")

    __table_args__ = (UniqueConstraint("user_id", "post_id", name="uq_post_upvote_user_post"),)


class PostComment(Base):
    """Comment on a community post."""

    __tablename__ = "post_comments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    post_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("community_posts.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    post: Mapped["CommunityPost"] = relationship(back_populates="comments")
    author: Mapped["User"] = relationship(back_populates="comments")


class Affirmation(Base):
    """Catalog affirmation text."""

    __tablename__ = "affirmations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[AffirmationCategory] = mapped_column(
        Enum(AffirmationCategory, name="affirmation_category"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    saved_by: Mapped[List["SavedAffirmation"]] = relationship(
        back_populates="affirmation", cascade="all, delete-orphan"
    )


class SavedAffirmation(Base):
    """User-saved affirmation join table."""

    __tablename__ = "saved_affirmations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    affirmation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("affirmations.id", ondelete="CASCADE"),
        index=True,
    )
    saved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="saved_affirmations")
    affirmation: Mapped["Affirmation"] = relationship(back_populates="saved_by")

    __table_args__ = (
        UniqueConstraint("user_id", "affirmation_id", name="uq_saved_affirmation_user_aff"),
    )


class Therapist(Base):
    """Licensed or listed therapist profile for bookings."""

    __tablename__ = "therapists"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    specialty: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    bookings: Mapped[List["Booking"]] = relationship(back_populates="therapist")


class Booking(Base):
    """Appointment between a user and therapist."""

    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    therapist_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("therapists.id", ondelete="CASCADE"), index=True
    )
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="booking_status"),
        nullable=False,
        default=BookingStatus.pending,
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="bookings")
    therapist: Mapped["Therapist"] = relationship(back_populates="bookings")
