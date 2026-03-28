"""Community posts, upvotes, and comments."""

from __future__ import annotations

import logging
from typing import Dict, List, Tuple
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.deps import get_current_user
from database import get_db
from models import CommunityPost, PostComment, PostUpvote, User
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


def _counts_for_posts(db: Session, post_ids: List[UUID]) -> Tuple[Dict[UUID, int], Dict[UUID, int]]:
    """Return upvote and comment count maps keyed by post id."""
    if not post_ids:
        return {}, {}
    up_rows = (
        db.query(PostUpvote.post_id, func.count(PostUpvote.id))
        .filter(PostUpvote.post_id.in_(post_ids))
        .group_by(PostUpvote.post_id)
        .all()
    )
    cm_rows = (
        db.query(PostComment.post_id, func.count(PostComment.id))
        .filter(PostComment.post_id.in_(post_ids))
        .group_by(PostComment.post_id)
        .all()
    )
    return {r[0]: int(r[1]) for r in up_rows}, {r[0]: int(r[1]) for r in cm_rows}


@router.get("/posts", response_model=PostListResponse)
def list_posts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostListResponse:
    """List community posts with engagement counts."""
    _ = current_user
    try:
        posts = db.query(CommunityPost).order_by(CommunityPost.created_at.desc()).all()
        ids = [p.id for p in posts]
        up_map, cm_map = _counts_for_posts(db, ids)
        out: List[PostResponse] = []
        for p in posts:
            author = db.query(User).filter(User.id == p.user_id).first()
            out.append(
                PostResponse(
                    id=p.id,
                    title=p.title,
                    body=p.body,
                    author_username=author.username if author else "unknown",
                    created_at=p.created_at,
                    upvote_count=up_map.get(p.id, 0),
                    comment_count=cm_map.get(p.id, 0),
                )
            )
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
        post = CommunityPost(user_id=current_user.id, title=body.title, body=body.body)
        db.add(post)
        db.commit()
        db.refresh(post)
        return PostResponse(
            id=post.id,
            title=post.title,
            body=post.body,
            author_username=current_user.username,
            created_at=post.created_at,
            upvote_count=0,
            comment_count=0,
        )
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
    """Register one upvote per user per post (idempotent if already voted)."""
    try:
        post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
        if post is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        existing = (
            db.query(PostUpvote)
            .filter(PostUpvote.post_id == post_id, PostUpvote.user_id == current_user.id)
            .first()
        )
        if existing is None:
            db.add(PostUpvote(post_id=post_id, user_id=current_user.id))
            db.commit()
            message = "Upvote recorded"
        else:
            message = "Already upvoted"
        up_map, _ = _counts_for_posts(db, [post_id])
        return {"status": "ok", "message": message, "upvote_count": up_map.get(post_id, 0)}
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
        comment = PostComment(post_id=post_id, user_id=current_user.id, body=body.body)
        db.add(comment)
        db.commit()
        db.refresh(comment)
        return CommentResponse(
            id=comment.id,
            body=comment.body,
            author_username=current_user.username,
            created_at=comment.created_at,
        )
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
            db.query(PostComment)
            .filter(PostComment.post_id == post_id)
            .order_by(PostComment.created_at.asc())
            .all()
        )
        out: List[CommentResponse] = []
        for c in rows:
            author = db.query(User).filter(User.id == c.user_id).first()
            out.append(
                CommentResponse(
                    id=c.id,
                    body=c.body,
                    author_username=author.username if author else "unknown",
                    created_at=c.created_at,
                )
            )
        return CommentListResponse(comments=out)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("list_comments failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load comments",
        ) from exc
