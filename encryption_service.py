"""Symmetric encryption and content hashing for sensitive journal data."""

from __future__ import annotations

import hashlib
import os
from functools import lru_cache

from cryptography.fernet import Fernet, InvalidToken
from dotenv import load_dotenv

load_dotenv()


@lru_cache(maxsize=1)
def _fernet() -> Fernet:
    """Build a Fernet instance from ENCRYPTION_KEY (url-safe base64 32-byte key)."""
    raw = os.getenv("ENCRYPTION_KEY")
    if not raw or not str(raw).strip():
        raise ValueError("ENCRYPTION_KEY is required for encryption operations")
    key = str(raw).strip().encode("utf-8")
    return Fernet(key)


def encrypt_text(text: str) -> str:
    """
    Encrypt plaintext using Fernet (symmetric encryption).

    Returns URL-safe base64 ciphertext as a string (Fernet token).
    """
    if text is None:
        raise ValueError("text must not be None")
    token = _fernet().encrypt(text.encode("utf-8"))
    return token.decode("utf-8")


def decrypt_text(encrypted_text: str) -> str:
    """
    Decrypt a Fernet token string back to plaintext.

    Raises ValueError if the token is invalid or cannot be decoded.
    """
    if encrypted_text is None:
        raise ValueError("encrypted_text must not be None")
    try:
        plain = _fernet().decrypt(encrypted_text.encode("utf-8"))
    except InvalidToken as exc:
        raise ValueError("Could not decrypt journal payload") from exc
    return plain.decode("utf-8")


def generate_content_hash(text: str) -> str:
    """
    Produce a deterministic SHA-256 hex digest of the given text (UTF-8).

    Used to fingerprint journal content without storing plaintext at rest.
    """
    if text is None:
        raise ValueError("text must not be None")
    return hashlib.sha256(text.encode("utf-8")).hexdigest()
