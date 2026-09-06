"""Retry staff Telegram/email for reservations where notify flags are still false.

Usage:

  python manage.py resend_reservation_notifications --ref=RB-ABC123
  python manage.py resend_reservation_notifications --unsent
  python manage.py resend_reservation_notifications --unsent --limit=50

Safe to re-run: uses the same claim/release idempotency as create-time notifies.
Never prints secrets.
"""

from __future__ import annotations

from django.core.management.base import BaseCommand, CommandError
from django.db.models import Q

from core.notifications.reservation import notify_reservation_created
from reservations.models import Reservation


class Command(BaseCommand):
    help = (
        "Resend staff Telegram and/or email for reservations that still have "
        "telegram_notified=False and/or staff_email_notified=False."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--ref",
            action="append",
            dest="refs",
            default=[],
            help="Reservation ref to retry (repeatable). Example: --ref=RB-ABC123",
        )
        parser.add_argument(
            "--unsent",
            action="store_true",
            help="Retry all reservations missing Telegram and/or staff email.",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=100,
            help="Max rows when using --unsent (default: 100).",
        )

    def handle(self, *args, **options):
        refs = [r.strip() for r in (options.get("refs") or []) if r and r.strip()]
        unsent = bool(options.get("unsent"))
        limit = int(options.get("limit") or 100)

        if not refs and not unsent:
            raise CommandError("Provide --ref=… and/or --unsent.")

        if limit < 1:
            raise CommandError("--limit must be >= 1.")

        unsent_q = Q(telegram_notified=False) | Q(staff_email_notified=False)

        if refs:
            qs = Reservation.objects.filter(ref__in=refs).order_by("created_at")
            if unsent:
                qs = qs.filter(unsent_q)
            rows = list(qs)
            found = {r.ref for r in rows}
            # Only treat as missing when the ref does not exist at all.
            existing = set(
                Reservation.objects.filter(ref__in=refs).values_list("ref", flat=True)
            )
            missing = [ref for ref in refs if ref not in existing]
            if missing:
                raise CommandError(
                    "No reservation found for ref(s): " + ", ".join(missing)
                )
            if unsent and not rows:
                self.stdout.write(
                    "Matching ref(s) found but already fully notified; nothing to resend."
                )
                return
        else:
            rows = list(
                Reservation.objects.filter(unsent_q)
                .order_by("created_at")[:limit]
            )

        if not rows:
            self.stdout.write("No matching reservations to resend.")
            return

        ok_tg = ok_mail = 0
        fail_tg = fail_mail = 0
        for row in rows:
            results = notify_reservation_created(row)
            tg = bool(results.get("telegram"))
            mail = bool(results.get("email"))
            row.refresh_from_db(
                fields=["telegram_notified", "staff_email_notified"]
            )
            # Final flag state (claim-skip counts as already sent).
            tg_done = row.telegram_notified
            mail_done = row.staff_email_notified
            if tg_done:
                ok_tg += 1
            else:
                fail_tg += 1
            if mail_done:
                ok_mail += 1
            else:
                fail_mail += 1
            self.stdout.write(
                f"{row.ref}: telegram={'OK' if tg_done else 'FAILED'} "
                f"(sent_now={tg}) staff_email={'OK' if mail_done else 'FAILED'} "
                f"(sent_now={mail})"
            )

        self.stdout.write("")
        self.stdout.write(
            f"Done: {len(rows)} reservation(s); "
            f"telegram OK={ok_tg} FAILED={fail_tg}; "
            f"staff_email OK={ok_mail} FAILED={fail_mail}"
        )
