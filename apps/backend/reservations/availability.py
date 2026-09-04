from __future__ import annotations

from datetime import date as date_cls
from datetime import datetime, time, timedelta

from django.conf import settings
from django.db.models import Sum
from django.utils import timezone

from reservations.models import (
    OpeningHours,
    Reservation,
    ReservationSettings,
    SpecialClosure,
)


def instant_booking_enabled(config: ReservationSettings | None = None) -> bool:
    """Instant confirmation is only allowed when we are confident the capacity
    is real: always in DEBUG (dev placeholder), and in production only once
    staff have explicitly flipped ``production_ready`` on.
    """
    if settings.DEBUG:
        return True
    config = config or ReservationSettings.load()
    return config.production_ready


def opening_for_date(target: date_cls) -> tuple[bool, time | None, time | None]:
    """Return (is_open, opens_at, closes_at) for a given date."""
    if SpecialClosure.objects.filter(date=target).exists():
        return False, None, None
    try:
        hours = OpeningHours.objects.get(weekday=target.weekday())
    except OpeningHours.DoesNotExist:
        return False, None, None
    if hours.is_closed or not hours.opens_at or not hours.closes_at:
        return False, None, None
    return True, hours.opens_at, hours.closes_at


def generate_slots(
    opens_at: time, closes_at: time, interval_minutes: int, buffer_minutes: int
) -> list[time]:
    """Slots from opening until the last seating (close minus buffer)."""
    base = date_cls(2000, 1, 1)
    start = datetime.combine(base, opens_at)
    last = datetime.combine(base, closes_at) - timedelta(minutes=buffer_minutes)
    step = timedelta(minutes=max(interval_minutes, 5))
    slots: list[time] = []
    # If the seating buffer is larger than the opening window, still offer
    # the opening time so the guest is not shown an empty open day.
    if last < start:
        return [opens_at]
    cursor = start
    while cursor <= last:
        slots.append(cursor.time())
        cursor += step
    return slots or [opens_at]


def booked_guests(target: date_cls, slot: time) -> int:
    total = (
        Reservation.objects.filter(
            date=target, time=slot, status__in=Reservation.ACTIVE_STATUSES
        ).aggregate(total=Sum("party_size"))["total"]
        or 0
    )
    return int(total)


def _slot_is_bookable(target: date_cls, slot: time, config: ReservationSettings) -> bool:
    """Enforce lead time for slots on the current day."""
    now = timezone.localtime()
    slot_dt = timezone.make_aware(datetime.combine(target, slot))
    return slot_dt >= now + timedelta(minutes=config.booking_lead_minutes)


def compute_availability(target: date_cls) -> dict:
    config = ReservationSettings.load()
    enabled = instant_booking_enabled(config)

    result = {
        "date": target.isoformat(),
        "enabled": enabled,
        "closed": False,
        "max_party_size": config.max_party_size,
        "horizon_days": config.booking_horizon_days,
        "slots": [],
    }

    if target < date_cls.today() or target > date_cls.today() + timedelta(
        days=config.booking_horizon_days
    ):
        result["closed"] = True
        return result

    is_open, opens_at, closes_at = opening_for_date(target)
    if not is_open:
        result["closed"] = True
        return result

    slots = generate_slots(
        opens_at,
        closes_at,
        config.slot_interval_minutes,
        config.last_seating_buffer_minutes,
    )

    slot_rows = []
    for slot in slots:
        if not _slot_is_bookable(target, slot, config):
            continue
        remaining = config.max_guests_per_slot - booked_guests(target, slot)
        slot_rows.append(
            {
                "time": slot.strftime("%H:%M"),
                "remaining": max(remaining, 0),
                "available": remaining > 0,
            }
        )
    result["slots"] = slot_rows
    return result
