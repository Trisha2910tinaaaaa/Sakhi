"""Community posts and comments schemas."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PostCreate(BaseModel):
    """Create a new community post."""

    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1, max_length=20_000)
    category: Optional[str] = Field(default=None, max_length=64)


class PostResponse(BaseModel):
    """Community post returned by API."""

    model_config = ConfigDict(from_attributes=False)

    id: UUID
    title: str
    content: str
    category: str
    author_username: str
    created_at: datetime
    upvotes: int
    comment_count: int

    # Backward-compatible aliases
    body: Optional[str] = None
    upvote_count: Optional[int] = None


class CommentCreate(BaseModel):
    """Create a comment on a post."""

    content: str = Field(..., min_length=1, max_length=8000)


class CommentResponse(BaseModel):
    """A single comment with author metadata."""

    model_config = ConfigDict(from_attributes=False)

    id: UUID
    content: str
    author_username: str
    created_at: datetime


class PostListResponse(BaseModel):
    posts: List[PostResponse]


class CommentListResponse(BaseModel):
    comments: List[CommentResponse]
