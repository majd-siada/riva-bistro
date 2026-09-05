from __future__ import annotations

from datetime import date as date_cls
from datetime import datetime, time, timedelta

from django.db import connection, transaction
from django.utils import timezone

from reservations.availability import (
    booked_guests,
    generate_slots,
    instant_booking_enabled,
    opening_for_date,
)
from reservations.models import Reservation, ReservationSettings


class BookingError(Exception):
    """Domain error with a Swedish, customer-safe message and a machine code."""

    code = "booking_error"
    message = "Något gick fel. Försök igen."
    http_status = 400

    def __init__(self, message: str | None = None):
        if message:
            self.message = message
        super().__init__(self.message)


class BookingNotEnabled(BookingError):
    code = "not_enabled"
    message = (
        "Onlinebokning är inte aktiverad just nu. Ring oss gärna så hjälper vi dig."
    )
    http_status = 503


class SlotClosed(BookingError):
    code = "closed"
    message = "Vi har stängt den valda dagen. Välj en annan dag."
    http_status = 409


class InvalidSlot(BookingError):
    code = "invalid_slot"
    message = "Välj en giltig tid."
    http_status = 400


class PastDate(BookingError):
    code = "past"
    message = "Välj ett datum och en tid framåt i tiden."
    http_status = 400


class InvalidParty(BookingError):
    code = "invalid_party"
    message = "Ange ett giltigt antal gäster."
    http_status = 400


class SlotFull(BookingError):
    code = "full"
    message = "Tyvärr är den valda tiden fullbokad. Välj en annan tid."
    http_status = 409


def _slot_lock_key(target: date_cls, slot: time) -> int:
    return int(f"{target:%Y%m%d}{slot:%H%M}")


@transaction.atomic
def create_reservation(*, name, phone, email, party_size, date, time, special_request=""):
    """Create a confirmed reservation with backend-enforced availability.

    Concurrency: a Postgres transaction-scoped advisory lock keyed on the slot
    serialises concurrent requests for the same date+time, so capacity is
    enforced at the database layer (no overbooking / double-booking).
    """
    config = ReservationSettings.load()

    if not instant_booking_enabled(config):
        raise BookingNotEnabled()

    # Lock the slot for the rest of the transaction.
    with connection.cursor() as cursor:
        cursor.execute("SELECT pg_advisory_xact_lock(%s)", [_slot_lock_key(date, time)])

    today = timezone.localdate()
    if date < today or date > today + timedelta(days=config.booking_horizon_days):
        raise PastDate() if date < today else SlotClosed()

    is_open, opens_at, closes_at = opening_for_date(date)
    if not is_open:
        raise SlotClosed()

    valid_slots = generate_slots(
        opens_at,
        closes_at,
        config.slot_interval_minutes,
        config.last_seating_buffer_minutes,
    )
    if time not in valid_slots:
        raise InvalidSlot()

    slot_dt = timezone.make_aware(datetime.combine(date, time))
    if slot_dt < timezone.localtime() + timedelta(minutes=config.booking_lead_minutes):
        raise PastDate()

    if party_size < 1 or party_size > config.max_party_size:
        raise InvalidParty(
            f"Vi tar emot bokningar för 1–{config.max_party_size} gäster online. "
            "Kontakta oss för större sällskap."
        )

    # Idempotency: an identical active booking made moments ago is treated as
    # the same submission (defends against double-clicks / retries).
    recent = timezone.now() - timedelta(minutes=5)
    duplicate = (
        Reservation.objects.filter(
            email__iexact=email,
            date=date,
            time=time,
            party_size=party_size,
            status__in=Reservation.ACTIVE_STATUSES,
            created_at__gte=recent,
        )
        .order_by("-created_at")
        .first()
    )
    if duplicate:
        return duplicate

    if booked_guests(date, time) + party_size > config.max_guests_per_slot:
        raise SlotFull()

    return Reservation.objects.create(
        name=name.strip(),
        phone=phone.strip(),
        email=email.strip(),
        party_size=party_size,
        date=date,
        time=time,
        special_request=special_request.strip(),
        status=Reservation.Status.CONFIRMED,
    )
