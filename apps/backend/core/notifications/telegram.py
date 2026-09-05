"""Telegram Bot API helper for staff alerts.

Credentials come only from the environment:
  TELEGRAM_BOT_TOKEN — bot token from @BotFather (never commit)
  TELEGRAM_CHAT_ID — destination chat/group/channel id

Uses the public HTTPS Bot API with a short timeout. Never logs the token.
"""

from __future__ import annotations

import json
import logging
import urllib.error
import urllib.parse
import urllib.request

from django.conf import settings

logger = logging.getLogger("riva.notifications.telegram")

TELEGRAM_API_BASE = "https://api.telegram.org"
REQUEST_TIMEOUT_SECONDS = 8


def _bot_token() -> str:
    return (getattr(settings, "TELEGRAM_BOT_TOKEN", "") or "").strip()


def _chat_id() -> str:
    return (getattr(settings, "TELEGRAM_CHAT_ID", "") or "").strip()


def telegram_configured() -> bool:
    return bool(_bot_token() and _chat_id())


def verify_bot() -> dict | None:
    """Call getMe. Returns the bot identity dict on success, else None.

    Never returns or logs the token.
    """
    token = _bot_token()
    if not token:
        logger.info("Telegram getMe skipped: TELEGRAM_BOT_TOKEN not set")
        return None
    url = f"{TELEGRAM_API_BASE}/bot{token}/getMe"
    try:
        with urllib.request.urlopen(url, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError):
        logger.exception("Telegram getMe failed")
        return None
    if not payload.get("ok"):
        logger.warning("Telegram getMe returned not-ok")
        return None
    result = payload.get("result") or {}
    logger.info(
        "Telegram bot verified username=%s id_set=%s",
        result.get("username"),
        bool(result.get("id")),
    )
    return result


def send_telegram_message(text: str, *, parse_mode: str | None = None) -> bool:
    """Send a plain text message to TELEGRAM_CHAT_ID. Returns True on success."""
    token = _bot_token()
    chat_id = _chat_id()
    if not token or not chat_id:
        logger.info("Telegram send skipped: token or chat id not configured")
        return False

    body: dict[str, str] = {"chat_id": chat_id, "text": text}
    if parse_mode:
        body["parse_mode"] = parse_mode
    data = urllib.parse.urlencode(body).encode("utf-8")
    url = f"{TELEGRAM_API_BASE}/bot{token}/sendMessage"
    request = urllib.request.Request(
        url,
        data=data,
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    try:
        with urllib.request.urlopen(request, timeout=REQUEST_TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError):
        logger.exception("Telegram sendMessage failed")
        return False

    if not payload.get("ok"):
        # Do not echo Telegram description (may include chat details).
        logger.warning("Telegram sendMessage returned not-ok")
        return False
    return True
