"""Community posts, upvotes, and comments."""

from __future__ import annotations

import logging
from typing import Dict, List, Optional, Tuple
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.deps import get_current_user
from database import get_db
from models import Comment, CommunityPost, PostUpvote, User
from schemas.community import (
    CommentCreate,
    CommentListResponse,
    CommentResponse,
    PostCreate,
    PostListResponse,
    PostResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/community", tags=["community"])


def _comment_to_response(row: Comment, author: User) -> CommentResponse:
    return CommentResponse(
        id=row.id,
        content=row.content,
        author_username=author.username,
        created_at=row.created_at,
    )


def _post_to_response(
    post: CommunityPost,
    author: User,
    upvote_count: int,
    comment_count: int,
) -> PostResponse:
    # Backward-compatible aliases for older UI.
    body_fallback = post.body
    content_fallback = post.content if post.content is not None else post.body
    return PostResponse(
        id=post.id,
        title=post.title,
        content=content_fallback,
        category=post.category,
        author_username=author.username,
        created_at=post.created_at,
        upvotes=upvote_count,
        comment_count=comment_count,
        body=body_fallback,
        upvote_count=upvote_count,
    )


def _get_counts(
    db: Session, post_ids: List[UUID]
) -> Tuple[Dict[UUID, int], Dict[UUID, int]]:
    if not post_ids:
        return {}, {}

    up_rows = (
        db.query(PostUpvote.post_id, func.count(PostUpvote.id))
        .filter(PostUpvote.post_id.in_(post_ids))
        .group_by(PostUpvote.post_id)
        .all()
    )
    cm_rows = (
        db.query(Comment.post_id, func.count(Comment.id))
        .filter(Comment.post_id.in_(post_ids))
        .group_by(Comment.post_id)
        .all()
    )

    up_map = {r[0]: int(r[1]) for r in up_rows}
    cm_map = {r[0]: int(r[1]) for r in cm_rows}
    return up_map, cm_map


@router.get("/posts", response_model=PostListResponse)
def list_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=12, ge=1, le=50),
) -> PostListResponse:
    """List community posts (paginated) with engagement counts."""
    _ = current_user  # reserved for future personalization
    try:
        offset = (page - 1) * page_size
        posts = (
            db.query(CommunityPost)
            .order_by(CommunityPost.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
        ids = [p.id for p in posts]
        up_map, cm_map = _get_counts(db, ids)

        out: List[PostResponse] = []
        for p in posts:
            author = db.query(User).filter(User.id == p.user_id).first()
            if author is None:
                continue
            upvotes = up_map.get(p.id, 0)
            comment_count = cm_map.get(p.id, 0)
            out.append(_post_to_response(p, author, upvotes, comment_count))
        return PostListResponse(posts=out)
    except Exception as exc:
        logger.exception("list_posts failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load community posts",
        ) from exc


@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    body: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostResponse:
    """Create a new community post."""
    try:
        category = (body.category or "daily").strip() if body.category else "daily"
        post = CommunityPost(
            user_id=current_user.id,
            title=body.title,
            body=body.content,  # legacy column
            content=body.content,
            category=category,
            upvotes=0,
        )
        db.add(post)
        db.commit()
        db.refresh(post)

        return _post_to_response(
            post,
            current_user,
            upvote_count=0,
            comment_count=0,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("create_post failed")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create post",
        ) from exc


@router.post("/posts/{post_id}/upvote", status_code=status.HTTP_200_OK)
def upvote_post(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Toggle upvote for the authenticated user."""
    try:
        post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
        if post is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

        existing = (
            db.query(PostUpvote)
            .filter(PostUpvote.post_id == post_id, PostUpvote.user_id == current_user.id)
            .first()
        )

        toggled_on = False
        if existing is None:
            db.add(PostUpvote(post_id=post_id, user_id=current_user.id))
            toggled_on = True
        else:
            db.delete(existing)

        db.commit()

        # Recompute and persist upvotes column for spec compliance.
        upvotes = (
            db.query(func.count(PostUpvote.id))
            .filter(PostUpvote.post_id == post_id)
            .scalar()
        )
        upvotes_int = int(upvotes or 0)
        post.upvotes = upvotes_int
        db.add(post)
        db.commit()

        return {
            "status": "ok",
            "upvotes": upvotes_int,
            "is_upvoted": toggled_on,
            "post_id": str(post_id),
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("upvote_post failed")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to upvote post",
        ) from exc


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    post_id: UUID,
    body: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CommentResponse:
    """Add a comment to a post."""
    try:
        post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
        if post is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

        comment = Comment(
            post_id=post_id,
            user_id=current_user.id,
            content=body.content,
        )
        db.add(comment)
        db.commit()
        db.refresh(comment)

        return _comment_to_response(comment, current_user)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("add_comment failed")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to add comment",
        ) from exc


@router.get("/posts/{post_id}/comments", response_model=CommentListResponse)
def list_comments(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CommentListResponse:
    """List comments for a post in chronological order."""
    _ = current_user
    try:
        post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
        if post is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

        rows = (
            db.query(Comment)
            .filter(Comment.post_id == post_id)
            .order_by(Comment.created_at.asc())
            .all()
        )

        out: List[CommentResponse] = []
        for c in rows:
            author = db.query(User).filter(User.id == c.user_id).first()
            if author is None:
                continue
            out.append(_comment_to_response(c, author))
        return CommentListResponse(comments=out)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("list_comments failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load comments",
        ) from exc

