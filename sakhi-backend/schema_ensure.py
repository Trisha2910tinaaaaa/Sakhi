"""Ensure Supabase schema matches Sakhi backend expectations.

This project currently runs with an existing Supabase instance that may already
have some tables/columns. For production readiness and to satisfy the spec
("tables exist with these columns"), we run a lightweight schema upgrade on
startup.

We intentionally use idempotent DDL (IF NOT EXISTS / safe updates) so the app
can boot even if schema is partially present.
"""

from __future__ import annotations

import logging

from sqlalchemy import text

from database import engine

logger = logging.getLogger(__name__)


def _table_exists(table_name: str) -> bool:
    """Return True if a table exists in public schema."""
    q = text(
        "SELECT 1 FROM information_schema.tables "
        "WHERE table_schema = 'public' AND table_name = :t LIMIT 1;"
    )
    with engine.connect() as conn:
        return conn.execute(q, {"t": table_name}).fetchone() is not None


def _run(stmt: str) -> None:
    """Execute a single SQL statement and commit."""
    with engine.begin() as conn:
        conn.execute(text(stmt))


def ensure_schema() -> None:
    """Upgrade database schema to required Sakhi layout."""
    try:
        # 1) users: add email_hash, mood_emoji, last_active
        if _table_exists("users"):
            _run(
                "ALTER TABLE users "
                "ADD COLUMN IF NOT EXISTS email_hash varchar(255);"
            )
            _run(
                "ALTER TABLE users "
                "ADD COLUMN IF NOT EXISTS mood_emoji varchar(32);"
            )
            _run(
                "ALTER TABLE users "
                "ADD COLUMN IF NOT EXISTS last_active timestamptz;"
            )
            _run("UPDATE users SET last_active = created_at WHERE last_active IS NULL;")

        # 2) journal_entries: add content_encrypted + mood_emoji
        if _table_exists("journal_entries"):
            _run(
                "ALTER TABLE journal_entries "
                "ADD COLUMN IF NOT EXISTS content_encrypted text;"
            )
            _run(
                "ALTER TABLE journal_entries "
                "ADD COLUMN IF NOT EXISTS mood_emoji varchar(32);"
            )
            # Backfill new column from existing encrypted_content (if present)
            _run(
                "UPDATE journal_entries "
                "SET content_encrypted = encrypted_content "
                "WHERE content_encrypted IS NULL AND encrypted_content IS NOT NULL;"
            )

        # 3) community_posts: add content, category, upvotes
        if _table_exists("community_posts"):
            _run(
                "ALTER TABLE community_posts "
                "ADD COLUMN IF NOT EXISTS content text NOT NULL DEFAULT '';"
            )
            _run(
                "ALTER TABLE community_posts "
                "ADD COLUMN IF NOT EXISTS category varchar(64) NOT NULL DEFAULT 'daily';"
            )
            _run(
                "ALTER TABLE community_posts "
                "ADD COLUMN IF NOT EXISTS upvotes integer NOT NULL DEFAULT 0;"
            )
            # Backfill content from existing body
            _run(
                "UPDATE community_posts "
                "SET content = body "
                "WHERE (content IS NULL OR content = '') AND body IS NOT NULL;"
            )
            # Backfill upvotes count from post_upvotes
            if _table_exists("post_upvotes"):
                _run(
                    "UPDATE community_posts cp "
                    "SET upvotes = COALESCE(p.cnt, 0) "
                    "FROM (SELECT post_id, COUNT(*)::int AS cnt "
                    "      FROM post_upvotes GROUP BY post_id) p "
                    "WHERE cp.id = p.post_id;"
                )

        # 4) comments: create required table (id, post_id, user_id, content, created_at)
        if not _table_exists("comments"):
            _run(
                "CREATE TABLE IF NOT EXISTS comments ("
                "  id uuid PRIMARY KEY, "
                "  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE, "
                "  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, "
                "  content text NOT NULL, "
                "  created_at timestamptz NOT NULL DEFAULT now()"
                ");"
            )
        # Optional migration from post_comments if comments empty
        if _table_exists("post_comments") and _table_exists("comments"):
            with engine.connect() as conn:
                existing = conn.execute(
                    text("SELECT COUNT(*) FROM comments;")
                ).scalar()
            if existing == 0:
                _run(
                    "INSERT INTO comments (id, post_id, user_id, content, created_at) "
                    "SELECT id, post_id, user_id, body, created_at "
                    "FROM post_comments "
                    "ON CONFLICT (id) DO NOTHING;"
                )

        # 5) therapist_bookings: create required table
        if not _table_exists("therapist_bookings"):
            _run(
                "CREATE TABLE IF NOT EXISTS therapist_bookings ("
                "  id uuid PRIMARY KEY, "
                "  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, "
                "  therapist_id uuid NOT NULL REFERENCES therapists(id) ON DELETE CASCADE, "
                "  session_date timestamptz NOT NULL, "
                "  status varchar(32) NOT NULL DEFAULT 'pending', "
                "  notes text, "
                "  created_at timestamptz NOT NULL DEFAULT now()"
                ");"
            )

        # Optional migration from bookings if therapist_bookings empty
        if _table_exists("bookings") and _table_exists("therapist_bookings"):
            with engine.connect() as conn:
                existing = conn.execute(
                    text("SELECT COUNT(*) FROM therapist_bookings;")
                ).scalar()
            if existing == 0:
                _run(
                    "INSERT INTO therapist_bookings "
                    "(id, user_id, therapist_id, session_date, status, notes, created_at) "
                    "SELECT id, user_id, therapist_id, scheduled_at, status::text, notes, created_at "
                    "FROM bookings "
                    "ON CONFLICT (id) DO NOTHING;"
                )

        # 6) therapists: ensure verified column exists for filtering
        if _table_exists("therapists"):
            _run(
                "ALTER TABLE therapists "
                "ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;"
            )

        logger.info("Schema ensure completed successfully.")
    except Exception:
        logger.exception("Schema ensure failed")
        raise

