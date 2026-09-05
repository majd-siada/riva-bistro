"""Official Riva Bistro weekly opening hours — single backend source of truth.

Provided by the restaurant. Do not invent, round, or reinterpret these values.

Friday closes at 00:00 (midnight) at the end of the Friday operating period.
Slot generation treats closes_at <= opens_at as overnight (see availability.generate_slots).
"""

from __future__ import annotations

from datetime import time
from typing import Protocol

# weekday → (opens_at, closes_at, is_closed)
# 0=Monday … 6=Sunday (Python/Django weekday convention)
OFFICIAL_OPENING_HOURS: dict[int, tuple[time, time, bool]] = {
    0: (time(10, 30), time(21, 0), False),  # Monday    10:30–21:00
    1: (time(10, 30), time(21, 0), False),  # Tuesday   10:30–21:00
    2: (time(10, 30), time(21, 0), False),  # Wednesday 10:30–21:00
    3: (time(10, 30), time(21, 0), False),  # Thursday  10:30–21:00
    4: (time(11, 30), time(0, 0), False),  # Friday    11:30–00:00
    5: (time(10, 30), time(23, 0), False),  # Saturday  10:30–23:00
    6: (time(10, 30), time(21, 0), False),  # Sunday    10:30–21:00
}

# Compact Swedish label for UI fallbacks (API hours remain authoritative).
OFFICIAL_HOURS_LABEL = (
    "Mån–Tor 10:30–21:00, Fre 11:30–00:00, Lör 10:30–23:00, Sön 10:30–21:00"
)

WEEKDAY_NAMES_SV = {
    0: "Måndag",
    1: "Tisdag",
    2: "Onsdag",
    3: "Torsdag",
    4: "Fredag",
    5: "Lördag",
    6: "Söndag",
}


class _HoursLike(Protocol):
    opens_at: time | None
    closes_at: time | None
    is_closed: bool


def is_uninitialized_placeholder(row: _HoursLike) -> bool:
    """True for synthetic/placeholder rows: closed with no open/close times.

    Production may contain seven such rows before real hours are applied.
    An intentional closed day looks the same on a single row — distinguish by
    checking whether the *whole week* is placeholders (see seed_reservations).
    """
    return bool(row.is_closed) and row.opens_at is None and row.closes_at is None


def official_hours_as_api_rows() -> list[dict]:
    """Shape matching OpeningHoursSerializer / public hours API."""
    rows: list[dict] = []
    for weekday in range(7):
        opens, closes, closed = OFFICIAL_OPENING_HOURS[weekday]
        rows.append(
            {
                "weekday": weekday,
                "weekday_label": WEEKDAY_NAMES_SV[weekday],
                "opens_at": None if closed else opens.strftime("%H:%M:%S"),
                "closes_at": None if closed else closes.strftime("%H:%M:%S"),
                "is_closed": closed,
            }
        )
    return rows
