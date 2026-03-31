"""
Seed the database with catalog affirmations (idempotent).

Run from the project root: ``python seed_affirmations.py``
Creates tables if they do not exist, then inserts twenty affirmations across five categories.
"""

from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from database import SessionLocal, engine
from models import Affirmation, AffirmationCategory, Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_SEED_DATA: list[tuple[str, AffirmationCategory]] = [
    ("I deserve compassion from myself, especially on hard days.", AffirmationCategory.self_love),
    ("My worth is not measured by my productivity.", AffirmationCategory.self_love),
    ("I am allowed to rest without earning it.", AffirmationCategory.self_love),
    ("Loving myself is a practice I can grow gently.", AffirmationCategory.self_love),
    ("I have survived difficult moments before; I can ride this wave too.", AffirmationCategory.strength),
    ("My courage is quiet and real, even when I do not feel brave.", AffirmationCategory.strength),
    ("I can take one small step right now—that is enough.", AffirmationCategory.strength),
    ("Boundaries protect my energy; they are an act of self respect.", AffirmationCategory.strength),
    ("I breathe in calm and breathe out what I cannot control.", AffirmationCategory.calm),
    ("This moment will shift; I can anchor myself in the present.", AffirmationCategory.calm),
    ("Slowing down is not failure; it is care.", AffirmationCategory.calm),
    ("My nervous system can soften as I offer it patience.", AffirmationCategory.calm),
    ("Something better may be ahead even if I cannot see it yet.", AffirmationCategory.hope),
    ("Hope can be tender; I hold it without demanding certainty.", AffirmationCategory.hope),
    ("I am allowed to imagine a kinder chapter for myself.", AffirmationCategory.hope),
    ("Light often returns in phases—I can wait with myself kindly.", AffirmationCategory.hope),
    ("Setbacks are part of growth, not proof that I am broken.", AffirmationCategory.resilience),
    ("I can adapt and begin again as many times as I need.", AffirmationCategory.resilience),
    ("Resilience is built in ordinary choices to keep going.", AffirmationCategory.resilience),
    ("I learn from difficulty without defining myself by it.", AffirmationCategory.resilience),
]


def seed(session: Session) -> int:
    """
    Insert seed affirmations when the catalog is empty.

    Returns the number of rows inserted.
    """
    existing = session.query(Affirmation).count()
    if existing > 0:
        logger.info("Affirmations already present (%s); skipping insert.", existing)
        return 0
    for text, category in _SEED_DATA:
        session.add(Affirmation(text=text, category=category))
    session.commit()
    logger.info("Inserted %s affirmations.", len(_SEED_DATA))
    return len(_SEED_DATA)


def main() -> None:
    """Create tables and run the affirmation seeder."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        inserted = seed(db)
    finally:
        db.close()
    logger.info("Done. New rows: %s", inserted)


if __name__ == "__main__":
    main()
