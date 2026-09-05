from datetime import time

from django.core.management.base import BaseCommand

from reservations.models import OpeningHours, ReservationSettings

# Owner-confirmed hours from Google Business listing (Hornsbergs Strand 57).
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
        "Seed owner-confirmed opening hours + reservation settings. "
        "Always leaves production_ready=False."
    )

    def handle(self, *args, **options):
        for weekday, (opens, closes, closed) in REFERENCE_HOURS.items():
            OpeningHours.objects.update_or_create(
                weekday=weekday,
                defaults={"opens_at": opens, "closes_at": closes, "is_closed": closed},
            )

        config = ReservationSettings.load()
        config.max_guests_per_slot = 20
        config.slot_interval_minutes = 30
        config.last_seating_buffer_minutes = 60
        config.max_party_size = 12
        # Explicit: never enable online booking from seed.
        config.production_ready = False
        config.save()

        self.stdout.write(
            self.style.SUCCESS(
                "Seeded opening hours (production_ready remains False)."
            )
        )
