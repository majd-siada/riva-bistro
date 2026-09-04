"""Shared upload sniffing — do not trust client Content-Type alone."""

from __future__ import annotations

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024


def sniff_image_kind(uploaded) -> str | None:
    """Return jpeg/png/webp if the file magic matches, else None."""
    position = uploaded.tell()
    try:
        head = uploaded.read(16)
    finally:
        uploaded.seek(position)
    if head.startswith(b"\xff\xd8\xff"):
        return "jpeg"
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if len(head) >= 12 and head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "webp"
    return None
