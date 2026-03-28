"""Community posts and comments schemas."""

from __future__ import annotations

from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PostCreate(BaseModel):
    """Create a new community post."""

    title: str = Field(..., min_length=1, max_length=255)
    body: str = Field(..., min_length=1, max_length=20_000)


class PostResponse(BaseModel):
    """Community post with lightweight author and engagement counts."""

    model_config = ConfigDict(from_attributes=False)

    id: UUID
    title: str
    body: str
    author_username: str
    created_at: datetime
    upvote_count: int
    comment_count: int


class CommentCreate(BaseModel):
    """Create a comment on a post."""

    body: str = Field(..., min_length=1, max_length=8000)


class CommentResponse(BaseModel):
    """A single comment with author metadata."""

    model_config = ConfigDict(from_attributes=False)

    id: UUID
    body: str
    author_username: str
    created_at: datetime


class PostListResponse(BaseModel):
    """List wrapper for posts."""

    posts: List[PostResponse]


class CommentListResponse(BaseModel):
    """List wrapper for comments."""

    comments: List[CommentResponse]
