"""Report notification channel configuration and optionally smoke-test sends.

Usage:

  python manage.py check_notifications
  python manage.py check_notifications --send-test

Never prints secret values — only SET/EMPTY and success/failure labels.
"""

from __future__ import annotations

from django.conf import settings
from django.core.management.base import BaseCommand


def _status(value: str) -> str:
    return "SET" if (value or "").strip() else "EMPTY"


class Command(BaseCommand):
    help = (
        "Show SET/EMPTY for Telegram, Hostinger, and SMTP notification env vars. "
        "With --send-test, smoke-send Telegram and staff email (never prints secrets)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--send-test",
            action="store_true",
            help="Send a Telegram ping and a staff notification test email.",
        )

    def handle(self, *args, **options):
        keys = [
            "TELEGRAM_BOT_TOKEN",
            "TELEGRAM_CHAT_ID",
            "HOSTINGER_MAIL_API_TOKEN",
            "HOSTINGER_MAIL_MAILBOX_RESOURCE_ID",
            "RESTAURANT_NOTIFICATION_EMAIL",
            "EMAIL_HOST",
            "EMAIL_HOST_USER",
            "DEFAULT_FROM_EMAIL",
            "EMAIL_BACKEND",
        ]
        self.stdout.write("Notification channel configuration (values hidden):")
        for key in keys:
            raw = getattr(settings, key, None)
            if raw is None:
                # EMAIL_BACKEND etc. always exist; fall back to env-style empty.
                raw = ""
            if not isinstance(raw, str):
                raw = str(raw)
            self.stdout.write(f"  {key}: {_status(raw)}")

        if not options["send_test"]:
            self.stdout.write(
                "Pass --send-test to smoke-send Telegram + staff email "
                "(requires channels to be configured)."
            )
            return

        self.stdout.write("")
        self.stdout.write("Running smoke sends…")

        from core.notifications.telegram import (
            send_telegram_message,
            telegram_configured,
            verify_bot,
        )

        if not telegram_configured():
            self.stdout.write(
                self.style.WARNING(
                    "Telegram: SKIPPED (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID EMPTY)"
                )
            )
        else:
            me = verify_bot()
            if me is None:
                self.stdout.write(self.style.ERROR("Telegram: getMe FAILED"))
            else:
                username = me.get("username") or "(unknown)"
                self.stdout.write(self.style.SUCCESS(f"Telegram: bot verified @{username}"))
                ok = send_telegram_message(
                    "Riva Bistro — notification test\n"
                    "If you see this, Telegram staff alerts are working."
                )
                if ok:
                    self.stdout.write(
                        self.style.SUCCESS("Telegram: sendMessage OK")
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR("Telegram: sendMessage FAILED")
                    )

        from core.notifications.staff_email import (
            hostinger_mail_configured,
            send_staff_reservation_email,
        )

        recipient = (getattr(settings, "RESTAURANT_NOTIFICATION_EMAIL", "") or "").strip()
        if not recipient:
            self.stdout.write(
                self.style.WARNING(
                    "Staff email: SKIPPED (RESTAURANT_NOTIFICATION_EMAIL EMPTY)"
                )
            )
            return

        channel = "Hostinger" if hostinger_mail_configured() else "Django SMTP"
        self.stdout.write(f"Staff email: attempting via {channel} → recipient SET")
        subject = "Riva Bistro — notification test"
        text = (
            "Riva Bistro\n"
            "Notification test\n\n"
            "If you received this, staff reservation email is working.\n"
        )
        html = (
            "<div style='font-family:system-ui,sans-serif;font-size:15px;'>"
            "<h2>Riva Bistro</h2>"
            "<p><strong>Notification test</strong></p>"
            "<p>If you received this, staff reservation email is working.</p>"
            "</div>"
        )
        ok = send_staff_reservation_email(subject=subject, text=text, html=html)
        if ok:
            self.stdout.write(self.style.SUCCESS("Staff email: send OK"))
        else:
            self.stdout.write(self.style.ERROR("Staff email: send FAILED"))
