"""Discover Telegram chat IDs for @RivaB_bot without exposing the bot token.

Usage (after the owner has started the bot / sent it a message):

  python manage.py telegram_discover_chat

Requires TELEGRAM_BOT_TOKEN in the environment. Never prints the token.
"""

from __future__ import annotations

import json
import urllib.error
import urllib.request

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = (
        "List recent Telegram chats that messaged the bot (getUpdates). "
        "Owner must message @RivaB_bot first. Never prints TELEGRAM_BOT_TOKEN."
    )

    def handle(self, *args, **options):
        token = (getattr(settings, "TELEGRAM_BOT_TOKEN", "") or "").strip()
        if not token:
            raise CommandError(
                "TELEGRAM_BOT_TOKEN is not set. Add it to the environment "
                "(never commit the real value), then re-run this command."
            )

        # Verify bot identity first (username only).
        me_url = f"https://api.telegram.org/bot{token}/getMe"
        try:
            with urllib.request.urlopen(me_url, timeout=8) as response:
                me = json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError) as exc:
            raise CommandError(f"Telegram getMe failed: {type(exc).__name__}") from None

        if not me.get("ok"):
            raise CommandError("Telegram getMe returned not-ok (check the token).")

        username = (me.get("result") or {}).get("username") or "(unknown)"
        self.stdout.write(self.style.SUCCESS(f"Bot verified: @{username}"))

        updates_url = f"https://api.telegram.org/bot{token}/getUpdates?limit=20"
        try:
            with urllib.request.urlopen(updates_url, timeout=8) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError) as exc:
            raise CommandError(f"Telegram getUpdates failed: {type(exc).__name__}") from None

        if not payload.get("ok"):
            raise CommandError("Telegram getUpdates returned not-ok.")

        chats: dict[str, str] = {}
        for update in payload.get("result") or []:
            message = update.get("message") or update.get("channel_post") or {}
            chat = message.get("chat") or {}
            chat_id = chat.get("id")
            if chat_id is None:
                continue
            label_parts = [
                chat.get("type") or "",
                chat.get("title") or "",
                chat.get("username") or "",
                chat.get("first_name") or "",
            ]
            label = " ".join(p for p in label_parts if p).strip() or "(no label)"
            chats[str(chat_id)] = label

        if not chats:
            self.stdout.write(
                self.style.WARNING(
                    "No recent chats found. Open Telegram, start @RivaB_bot, "
                    "send any message, then re-run this command. "
                    "Set TELEGRAM_CHAT_ID in .env to the chat id you want."
                )
            )
            return

        self.stdout.write("Recent chat ids (set TELEGRAM_CHAT_ID to one of these):")
        for chat_id, label in chats.items():
            self.stdout.write(f"  {chat_id}  —  {label}")
