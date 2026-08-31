from datetime import time

from django.core.management.base import BaseCommand

from reservations.models import OpeningHours, ReservationSettings

# Reference opening hours from design brief.
REFERENCE_HOURS = {
    0: (time(16, 0), time(23, 0), False),  # Mån
    1: (time(16, 0), time(23, 0), False),  # Tis
    2: (time(16, 0), time(23, 0), False),  # Ons
    3: (time(16, 0), time(23, 0), False),  # Tor
    4: (time(16, 0), time(23, 0), False),  # Fre
    5: (time(12, 0), time(23, 0), False),  # Lör
    6: (time(12, 0), time(23, 0), False),  # Sön
}


class Command(BaseCommand):
    help = "Seed reference opening hours + development reservation settings."

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
        config.production_ready = False
        config.save()

        self.stdout.write(
            self.style.SUCCESS(
                "Seeded reference opening hours + dev reservation settings."
            )
        )
