from django.core.management.base import BaseCommand

from reservations.models import OpeningHours, ReservationSettings
from reservations.official_hours import (
    OFFICIAL_OPENING_HOURS,
    is_uninitialized_placeholder,
)


class Command(BaseCommand):
    help = (
        "Safely initialize official opening hours. "
        "Creates missing weekdays. If all seven existing rows are uninitialized "
        "placeholders (is_closed=true, opens_at=null, closes_at=null), replaces "
        "them with the official schedule — without --force-hours. "
        "Never overwrites configured times or intentional closed days. "
        "Never changes production_ready."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--force-hours",
            action="store_true",
            help=(
                "Overwrite every OpeningHours row with OFFICIAL_OPENING_HOURS. "
                "Do not use on production after the owner has customized hours."
            ),
        )

    def handle(self, *args, **options):
        force = options["force_hours"]
        created = 0
        skipped = 0
        updated = 0

        existing = {row.weekday: row for row in OpeningHours.objects.all()}
        # Production-safe init: only when the full week is placeholder stubs.
        all_placeholders = len(existing) == 7 and all(
            is_uninitialized_placeholder(existing[weekday]) for weekday in range(7)
        )

        for weekday, (opens, closes, closed) in OFFICIAL_OPENING_HOURS.items():
            row = existing.get(weekday)

            if force:
                _, was_created = OpeningHours.objects.update_or_create(
                    weekday=weekday,
                    defaults={
                        "opens_at": opens,
                        "closes_at": closes,
                        "is_closed": closed,
                    },
                )
                if was_created:
                    created += 1
                else:
                    updated += 1
                continue

            if row is None:
                OpeningHours.objects.create(
                    weekday=weekday,
                    opens_at=opens,
                    closes_at=closes,
                    is_closed=closed,
                )
                created += 1
                continue

            if all_placeholders:
                row.opens_at = opens
                row.closes_at = closes
                row.is_closed = closed
                row.save(update_fields=["opens_at", "closes_at", "is_closed"])
                updated += 1
                continue

            # Preserve configured open hours and intentional closed days.
            skipped += 1

        # Ensure settings singleton exists; do not change production_ready.
        settings_obj = ReservationSettings.load()

        if all_placeholders and not force:
            self.stdout.write(
                self.style.SUCCESS(
                    "Initialized all seven placeholder OpeningHours rows "
                    f"to the official schedule (updated={updated})."
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Opening hours: created={created} updated={updated} "
                    f"preserved={skipped}."
                )
            )

        # Always dump the resulting week so operators can verify the live DB
        # (avoids mistaking frontend fallback hours for seeded API data).
        self.stdout.write("Current OpeningHours in database:")
        for row in OpeningHours.objects.order_by("weekday"):
            if row.is_closed or row.opens_at is None or row.closes_at is None:
                detail = "CLOSED (null times)" if row.opens_at is None else "CLOSED"
            else:
                detail = f"{row.opens_at:%H:%M}–{row.closes_at:%H:%M}"
            self.stdout.write(f"  weekday={row.weekday} {row.get_weekday_display()}: {detail}")
        self.stdout.write(
            f"production_ready={settings_obj.production_ready} (unchanged by this command)."
        )
