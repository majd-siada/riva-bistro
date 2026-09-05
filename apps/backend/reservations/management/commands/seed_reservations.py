from datetime import time

from django.core.management.base import BaseCommand

from reservations.models import OpeningHours, ReservationSettings

# Reference hours from the owner Google Business listing (Hornsbergs Strand 57).
# Friday closes at midnight → stored as 00:00 (overnight; see generate_slots).
# Do NOT flip production_ready here — that remains an intentional admin step.
REFERENCE_HOURS = {
    0: (time(10, 30), time(21, 0), False),  # Mån
    1: (time(10, 30), time(21, 0), False),  # Tis
    2: (time(10, 30), time(21, 0), False),  # Ons
    3: (time(10, 30), time(21, 0), False),  # Tor
    4: (time(11, 30), time(0, 0), False),  # Fre 11:30–00
    5: (time(10, 30), time(23, 0), False),  # Lör
    6: (time(10, 30), time(21, 0), False),  # Sön
}


class Command(BaseCommand):
    help = (
        "Seed opening hours (only missing weekdays) + reservation settings. "
        "Never overwrites hours the restaurant already configured. "
        "Always leaves production_ready=False."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--force-hours",
            action="store_true",
            help=(
                "Overwrite existing OpeningHours rows with REFERENCE_HOURS. "
                "Do not use on production after the owner has edited hours."
            ),
        )

    def handle(self, *args, **options):
        force = options["force_hours"]
        created = 0
        skipped = 0
        updated = 0

        for weekday, (opens, closes, closed) in REFERENCE_HOURS.items():
            existing = OpeningHours.objects.filter(weekday=weekday).first()
            if existing and not force:
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
