"""Privacy-preserving purge of booking/contact personal data after 30 days.

Public policy (integritetspolicy): retain booking/contact personal data up to
30 days after the reservation date (bookings) or receipt date (inquiries),
then remove or anonymize personal fields.

Does not delete operational booking rows (date/time/party/status/ref) — only
scrubs personal fields so capacity history remains. Contact and event inquiry
rows are deleted in full (they are personal correspondence).
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from core.models import ContactMessage, EventInquiry
from reservations.models import Reservation

logger = logging.getLogger("riva.privacy")

RETENTION_DAYS = 30

# Stable sentinels so a second run is a no-op for already-scrubbed bookings.
REDACTED_NAME = "[raderad]"
REDACTED_EMAIL = "redacted@invalid.local"
REDACTED_PHONE = ""


@dataclass(frozen=True)
class PurgeResult:
    reservations_scrubbed: int
    contacts_deleted: int
    events_deleted: int

    @property
    def total(self) -> int:
        return self.reservations_scrubbed + self.contacts_deleted + self.events_deleted


def retention_cutoff_date():
    """Dates on or before this calendar day are past the 30-day window."""
    return timezone.localdate() - timedelta(days=RETENTION_DAYS)


def _reservation_already_scrubbed(row: Reservation) -> bool:
    return row.email == REDACTED_EMAIL and row.name == REDACTED_NAME


def purge_personal_data(*, dry_run: bool = False) -> PurgeResult:
    """Scrub/delete eligible personal data. Safe to run repeatedly."""
    cutoff = retention_cutoff_date()
    today = timezone.localdate()

    reservation_qs = Reservation.objects.filter(date__lte=cutoff).exclude(
        email=REDACTED_EMAIL,
        name=REDACTED_NAME,
    )
    # Never touch future reservation dates (belt-and-suspenders with cutoff).
    reservation_qs = reservation_qs.filter(date__lt=today)

    contact_qs = ContactMessage.objects.filter(created_at__date__lte=cutoff)
    event_qs = EventInquiry.objects.filter(created_at__date__lte=cutoff)

    res_count = reservation_qs.count()
    contact_count = contact_qs.count()
    event_count = event_qs.count()

    if dry_run:
        logger.info(
            "privacy_purge dry_run cutoff=%s reservations=%s contacts=%s events=%s",
            cutoff.isoformat(),
            res_count,
            contact_count,
            event_count,
        )
        return PurgeResult(res_count, contact_count, event_count)

    scrubbed = 0
    with transaction.atomic():
        for row in reservation_qs.iterator():
            if _reservation_already_scrubbed(row):
                continue
            row.name = REDACTED_NAME
            row.email = REDACTED_EMAIL
            row.phone = REDACTED_PHONE
            row.special_request = ""
            row.save(
                update_fields=[
                    "name",
                    "email",
                    "phone",
                    "special_request",
                    "updated_at",
                ]
            )
            scrubbed += 1

        contacts_deleted, _ = contact_qs.delete()
        events_deleted, _ = event_qs.delete()

    logger.info(
        "privacy_purge applied cutoff=%s reservations_scrubbed=%s "
        "contacts_deleted=%s events_deleted=%s",
        cutoff.isoformat(),
        scrubbed,
        contacts_deleted,
        events_deleted,
    )
    return PurgeResult(scrubbed, contacts_deleted, events_deleted)
