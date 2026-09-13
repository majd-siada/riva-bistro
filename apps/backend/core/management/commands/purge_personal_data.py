"""Management command: purge personal data past the 30-day retention window.

Schedule daily on the VPS, e.g.:

  15 3 * * * cd /opt/riva-bistro && docker compose -f docker-compose.production.yml \\
      exec -T backend python manage.py purge_personal_data

Or: ./scripts/purge-personal-data.sh
"""

from __future__ import annotations

from django.core.management.base import BaseCommand

from core.privacy_purge import purge_personal_data


class Command(BaseCommand):
    help = (
        "Anonymize booking personal fields and delete contact/event inquiries "
        "older than 30 days (integritetspolicy retention)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Count eligible rows without changing the database.",
        )

    def handle(self, *args, **options):
        dry_run = bool(options["dry_run"])
        result = purge_personal_data(dry_run=dry_run)
        mode = "dry-run" if dry_run else "applied"
        self.stdout.write(
            self.style.SUCCESS(
                f"privacy_purge {mode}: "
                f"reservations_scrubbed={result.reservations_scrubbed} "
                f"contacts_deleted={result.contacts_deleted} "
                f"events_deleted={result.events_deleted}"
            )
        )
