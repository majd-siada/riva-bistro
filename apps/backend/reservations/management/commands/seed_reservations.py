from django.core.management.base import BaseCommand

from reservations.models import OpeningHours, ReservationSettings
from reservations.official_hours import OFFICIAL_OPENING_HOURS


class Command(BaseCommand):
    help = (
        "Seed official opening hours (missing/blank weekdays) + reservation settings. "
        "Never overwrites weekdays that already have real open/close times unless "
        "--force-hours is passed. Always leaves production_ready=False."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--force-hours",
            action="store_true",
            help=(
                "Overwrite existing OpeningHours rows with OFFICIAL_OPENING_HOURS. "
                "Use on production only when applying the restaurant's official "
                "schedule over empty/wrong stubs — not after custom owner edits."
            ),
        )

    def handle(self, *args, **options):
        force = options["force_hours"]
        created = 0
        skipped = 0
        updated = 0

        for weekday, (opens, closes, closed) in OFFICIAL_OPENING_HOURS.items():
            existing = OpeningHours.objects.filter(weekday=weekday).first()
            if existing and not force:
                # Preserve owner-configured (or previously seeded) real times.
                # Blank stubs (null opens + null closes) are treated as uninitialized
                # and filled with the official schedule without requiring --force-hours.
                if existing.opens_at is not None or existing.closes_at is not None:
                    skipped += 1
                    continue
            _, was_created = OpeningHours.objects.update_or_create(
                weekday=weekday,
                defaults={"opens_at": opens, "closes_at": closes, "is_closed": closed},
            )
            if was_created:
                created += 1
            else:
                updated += 1

        config = ReservationSettings.load()
        # Never enable online booking from seed. Leave other capacity fields as-is
        # so production owner tuning is preserved.
        config.production_ready = False
        config.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"Opening hours: created={created} updated={updated} "
                f"preserved={skipped}. production_ready remains False."
            )
        )
