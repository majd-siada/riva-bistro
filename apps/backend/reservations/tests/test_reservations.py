from datetime import date, time, timedelta

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from reservations.models import (
    OpeningHours,
    Reservation,
    ReservationSettings,
    SpecialClosure,
)


def _target_date(days: int = 2) -> date:
    return date.today() + timedelta(days=days)


def _open_all_week(opens=time(11, 0), closes=time(22, 0)):
    for weekday in range(7):
        OpeningHours.objects.update_or_create(
            weekday=weekday,
            defaults={"opens_at": opens, "closes_at": closes, "is_closed": False},
        )
    # pytest-django runs with DEBUG=False, so instant booking is gated by
    # production_ready. Enable it for the tests that exercise real bookings.
    config = ReservationSettings.load()
    config.production_ready = True
    config.save()


@pytest.fixture
def api():
    return APIClient()


@pytest.mark.django_db
def test_availability_open_day_returns_slots(api):
    _open_all_week()
    ReservationSettings.load()
    target = _target_date()
    resp = api.get(f"/api/v1/reservations/availability/?date={target.isoformat()}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["enabled"] is True
    assert body["closed"] is False
    assert len(body["slots"]) > 0


@pytest.mark.django_db
def test_availability_closed_on_special_closure(api):
    _open_all_week()
    target = _target_date()
    SpecialClosure.objects.create(date=target, reason="Helgdag")
    resp = api.get(f"/api/v1/reservations/availability/?date={target.isoformat()}")
    assert resp.json()["closed"] is True


@pytest.mark.django_db
def test_availability_past_date_is_closed(api):
    _open_all_week()
    past = (date.today() - timedelta(days=1)).isoformat()
    resp = api.get(f"/api/v1/reservations/availability/?date={past}")
    assert resp.json()["closed"] is True


@pytest.mark.django_db
def test_create_reservation_success(api):
    _open_all_week()
    ReservationSettings.load()
    target = _target_date()
    payload = {
        "name": "Anna",
        "phone": "0700000000",
        "email": "anna@example.com",
        "party_size": 2,
        "date": target.isoformat(),
        "time": "12:00",
    }
    resp = api.post("/api/v1/reservations/", payload, format="json")
    assert resp.status_code == 201
    body = resp.json()
    assert body["status"] == "confirmed"
    assert body["ref"].startswith("RB-")
    assert Reservation.objects.filter(ref=body["ref"]).exists()


@pytest.mark.django_db
def test_capacity_is_enforced(api):
    _open_all_week()
    config = ReservationSettings.load()
    config.max_guests_per_slot = 4
    config.save()
    target = _target_date()
    base = {
        "phone": "0700000000",
        "email": "guest@example.com",
        "date": target.isoformat(),
        "time": "12:00",
    }
    first = api.post(
        "/api/v1/reservations/", {**base, "name": "Anna", "party_size": 4}, format="json"
    )
    assert first.status_code == 201
    # Slot is now full; a further guest must be rejected at the backend.
    second = api.post(
        "/api/v1/reservations/",
        {**base, "name": "Bertil", "email": "b@example.com", "party_size": 1},
        format="json",
    )
    assert second.status_code == 409
    assert second.json()["code"] == "full"


@pytest.mark.django_db
def test_party_size_limit(api):
    _open_all_week()
    config = ReservationSettings.load()
    config.max_party_size = 8
    config.save()
    target = _target_date()
    resp = api.post(
        "/api/v1/reservations/",
        {
            "name": "Big",
            "phone": "0700000000",
            "email": "big@example.com",
            "party_size": 20,
            "date": target.isoformat(),
            "time": "12:00",
        },
        format="json",
    )
    assert resp.status_code == 400
    assert resp.json()["code"] == "invalid_party"


@pytest.mark.django_db
def test_invalid_slot_rejected(api):
    _open_all_week()
    ReservationSettings.load()
    target = _target_date()
    resp = api.post(
        "/api/v1/reservations/",
        {
            "name": "Xena",
            "phone": "0700000000",
            "email": "x@example.com",
            "party_size": 2,
            "date": target.isoformat(),
            "time": "03:07",
        },
        format="json",
    )
    assert resp.status_code == 400
    assert resp.json()["code"] == "invalid_slot"


@pytest.mark.django_db
def test_duplicate_submission_is_idempotent(api):
    _open_all_week()
    ReservationSettings.load()
    target = _target_date()
    payload = {
        "name": "Anna",
        "phone": "0700000000",
        "email": "anna@example.com",
        "party_size": 2,
        "date": target.isoformat(),
        "time": "12:00",
    }
    first = api.post("/api/v1/reservations/", payload, format="json")
    second = api.post("/api/v1/reservations/", payload, format="json")
    assert first.status_code == second.status_code == 201
    assert first.json()["ref"] == second.json()["ref"]
    assert Reservation.objects.count() == 1


@pytest.mark.django_db
def test_production_guard_blocks_when_not_ready(api, settings):
    settings.DEBUG = False
    _open_all_week()
    config = ReservationSettings.load()
    config.production_ready = False
    config.save()
    target = _target_date()

    availability = api.get(
        f"/api/v1/reservations/availability/?date={target.isoformat()}"
    )
    assert availability.json()["enabled"] is False
    assert availability.json()["closed"] is False
    assert len(availability.json()["slots"]) > 0

    resp = api.post(
        "/api/v1/reservations/",
        {
            "name": "Anna",
            "phone": "0700000000",
            "email": "anna@example.com",
            "party_size": 2,
            "date": target.isoformat(),
            "time": "12:00",
        },
        format="json",
    )
    assert resp.status_code == 503
    assert resp.json()["code"] == "not_enabled"


@pytest.mark.django_db
def test_debug_does_not_bypass_production_ready_gate(api, settings):
    """DEBUG=True must not enable bookings when production_ready is False."""
    settings.DEBUG = True
    _open_all_week()
    config = ReservationSettings.load()
    config.production_ready = False
    config.save()
    target = _target_date()

    availability = api.get(
        f"/api/v1/reservations/availability/?date={target.isoformat()}"
    )
    assert availability.json()["enabled"] is False

    resp = api.post(
        "/api/v1/reservations/",
        {
            "name": "Dev Guest",
            "phone": "0700000001",
            "email": "dev@example.com",
            "party_size": 2,
            "date": target.isoformat(),
            "time": "12:00",
        },
        format="json",
    )
    assert resp.status_code == 503
    assert resp.json()["code"] == "not_enabled"
    assert not Reservation.objects.filter(email="dev@example.com").exists()


@pytest.mark.django_db
def test_public_booking_ignores_csrf_even_with_authenticated_session():
    # A staff member (or anyone with an authenticated Django session) browsing
    # the public site must still be able to book — the public endpoint has no
    # session auth, so CSRF is never enforced.
    _open_all_week()
    user = get_user_model().objects.create_user("staff", password="x", is_staff=True)
    client = APIClient(enforce_csrf_checks=True)
    client.force_login(user)
    target = _target_date()
    resp = client.post(
        "/api/v1/reservations/",
        {
            "name": "Johan",
            "phone": "0700000000",
            "email": "johan@example.com",
            "party_size": 2,
            "date": target.isoformat(),
            "time": "12:00",
        },
        format="json",
    )
    assert resp.status_code == 201


@pytest.mark.django_db
def test_production_guard_allows_when_ready(api, settings):
    settings.DEBUG = False
    _open_all_week()
    config = ReservationSettings.load()
    config.production_ready = True
    config.save()
    target = _target_date()
    resp = api.post(
        "/api/v1/reservations/",
        {
            "name": "Anna",
            "phone": "0700000000",
            "email": "anna@example.com",
            "party_size": 2,
            "date": target.isoformat(),
            "time": "12:00",
        },
        format="json",
    )
    assert resp.status_code == 201


def test_generate_slots_when_buffer_eats_window():
    from datetime import time as time_cls

    from reservations.availability import generate_slots

    slots = generate_slots(time_cls(18, 0), time_cls(19, 0), 30, 180)
    assert slots == [time_cls(18, 0)]


def test_generate_slots_overnight_friday_midnight_close():
    """Friday 11:30–00:00 must produce evening slots (not collapse to open only)."""
    from datetime import time as time_cls

    from reservations.availability import generate_slots

    slots = generate_slots(time_cls(11, 30), time_cls(0, 0), 30, 60)
    assert slots[0] == time_cls(11, 30)
    assert time_cls(22, 0) in slots
    assert time_cls(23, 0) in slots
    assert time_cls(0, 0) not in slots


@pytest.mark.django_db
def test_weekday_closed_availability_and_create(api):
    """A weekday marked is_closed must report closed and reject create."""
    _open_all_week()
    target = _target_date(days=3)
    OpeningHours.objects.update_or_create(
        weekday=target.weekday(),
        defaults={"opens_at": None, "closes_at": None, "is_closed": True},
    )

    availability = api.get(
        f"/api/v1/reservations/availability/?date={target.isoformat()}"
    )
    assert availability.status_code == 200
    assert availability.json()["closed"] is True

    resp = api.post(
        "/api/v1/reservations/",
        {
            "name": "Anna",
            "phone": "0700000000",
            "email": "anna@example.com",
            "party_size": 2,
            "date": target.isoformat(),
            "time": "12:00",
        },
        format="json",
    )
    assert resp.status_code == 409
    assert resp.json()["code"] == "closed"


@pytest.mark.django_db
def test_booking_horizon_rejects_far_future(api):
    _open_all_week()
    config = ReservationSettings.load()
    config.booking_horizon_days = 7
    config.save()
    far = _target_date(days=30)

    availability = api.get(
        f"/api/v1/reservations/availability/?date={far.isoformat()}"
    )
    assert availability.json()["closed"] is True

    resp = api.post(
        "/api/v1/reservations/",
        {
            "name": "Anna",
            "phone": "0700000000",
            "email": "anna@example.com",
            "party_size": 2,
            "date": far.isoformat(),
            "time": "12:00",
        },
        format="json",
    )
    assert resp.status_code in (400, 409)
    assert resp.json()["code"] in {"past", "closed"}


@pytest.mark.django_db
def test_hours_endpoint_returns_seven_days(api):
    _open_all_week()
    resp = api.get("/api/v1/hours/")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == 7
    assert {row["weekday"] for row in body} == set(range(7))


@pytest.mark.django_db
def test_availability_requires_date(api):
    resp = api.get("/api/v1/reservations/availability/")
    assert resp.status_code == 400


@pytest.mark.django_db
def test_availability_rejects_malformed_date(api):
    resp = api.get("/api/v1/reservations/availability/?date=not-a-date")
    assert resp.status_code == 400


@pytest.mark.django_db
def test_create_missing_fields_creates_no_row(api):
    _open_all_week()
    before = Reservation.objects.count()
    resp = api.post("/api/v1/reservations/", {"name": "Anna"}, format="json")
    assert resp.status_code == 400
    assert Reservation.objects.count() == before


@pytest.mark.django_db
def test_create_invalid_email_creates_no_row(api):
    _open_all_week()
    target = _target_date()
    before = Reservation.objects.count()
    resp = api.post(
        "/api/v1/reservations/",
        {
            "name": "Anna",
            "phone": "0700000000",
            "email": "not-an-email",
            "party_size": 2,
            "date": target.isoformat(),
            "time": "12:00",
        },
        format="json",
    )
    assert resp.status_code == 400
    assert Reservation.objects.count() == before


@pytest.mark.django_db
def test_create_short_phone_rejected(api):
    _open_all_week()
    target = _target_date()
    before = Reservation.objects.count()
    resp = api.post(
        "/api/v1/reservations/",
        {
            "name": "Anna",
            "phone": "12",
            "email": "anna@example.com",
            "party_size": 2,
            "date": target.isoformat(),
            "time": "12:00",
        },
        format="json",
    )
    assert resp.status_code == 400
    assert Reservation.objects.count() == before


@pytest.mark.django_db
def test_create_past_date_rejected(api):
    _open_all_week()
    past = (date.today() - timedelta(days=1)).isoformat()
    before = Reservation.objects.count()
    resp = api.post(
        "/api/v1/reservations/",
        {
            "name": "Anna",
            "phone": "0700000000",
            "email": "anna@example.com",
            "party_size": 2,
            "date": past,
            "time": "12:00",
        },
        format="json",
    )
    assert resp.status_code == 400
    assert resp.json()["code"] == "past"
    assert Reservation.objects.count() == before


@pytest.mark.django_db
def test_create_on_special_closure_rejected(api):
    _open_all_week()
    target = _target_date()
    SpecialClosure.objects.create(date=target, reason="Privat fest")
    before = Reservation.objects.count()
    resp = api.post(
        "/api/v1/reservations/",
        {
            "name": "Anna",
            "phone": "0700000000",
            "email": "anna@example.com",
            "party_size": 2,
            "date": target.isoformat(),
            "time": "12:00",
        },
        format="json",
    )
    assert resp.status_code == 409
    assert resp.json()["code"] == "closed"
    assert Reservation.objects.count() == before


@pytest.mark.django_db
def test_create_at_max_party_size_accepted(api):
    _open_all_week()
    config = ReservationSettings.load()
    config.max_party_size = 8
    config.max_guests_per_slot = 20
    config.save()
    target = _target_date()
    resp = api.post(
        "/api/v1/reservations/",
        {
            "name": "Anna",
            "phone": "0700000000",
            "email": "anna@example.com",
            "party_size": 8,
            "date": target.isoformat(),
            "time": "12:00",
        },
        format="json",
    )
    assert resp.status_code == 201
    assert resp.json()["party_size"] == 8


@pytest.mark.django_db
def test_production_guard_leaves_no_row(api, settings):
    settings.DEBUG = False
    _open_all_week()
    config = ReservationSettings.load()
    config.production_ready = False
    config.save()
    target = _target_date()
    before = Reservation.objects.count()
    resp = api.post(
        "/api/v1/reservations/",
        {
            "name": "Anna",
            "phone": "0700000000",
            "email": "anna@example.com",
            "party_size": 2,
            "date": target.isoformat(),
            "time": "12:00",
        },
        format="json",
    )
    assert resp.status_code == 503
    assert resp.json()["code"] == "not_enabled"
    assert Reservation.objects.count() == before


@pytest.mark.django_db
def test_seed_reservations_preserves_existing_hours():
    from django.core.management import call_command

    OpeningHours.objects.update_or_create(
        weekday=0,
        defaults={"opens_at": time(9, 0), "closes_at": time(17, 0), "is_closed": False},
    )
    call_command("seed_reservations")
    monday = OpeningHours.objects.get(weekday=0)
    assert monday.opens_at == time(9, 0)
    assert monday.closes_at == time(17, 0)


@pytest.mark.django_db
def test_seed_initializes_all_placeholder_rows_to_official_hours():
    """Production-like state: seven closed/null stubs → official schedule, no --force."""
    from django.core.management import call_command

    from reservations.official_hours import OFFICIAL_OPENING_HOURS

    OpeningHours.objects.all().delete()
    for weekday in range(7):
        OpeningHours.objects.create(
            weekday=weekday,
            opens_at=None,
            closes_at=None,
            is_closed=True,
        )

    config = ReservationSettings.load()
    config.production_ready = True
    config.save()

    call_command("seed_reservations")

    assert OpeningHours.objects.count() == 7
    for weekday, (opens, closes, closed) in OFFICIAL_OPENING_HOURS.items():
        row = OpeningHours.objects.get(weekday=weekday)
        assert row.opens_at == opens
        assert row.closes_at == closes
        assert row.is_closed is closed

    # Must not flip production_ready.
    assert ReservationSettings.load().production_ready is True

    friday = OpeningHours.objects.get(weekday=4)
    assert friday.opens_at == time(11, 30)
    assert friday.closes_at == time(0, 0)
    assert friday.is_closed is False


@pytest.mark.django_db
def test_seed_preserves_intentional_closed_day_when_week_is_configured():
    """A closed/null day next to real hours is intentional — do not overwrite."""
    from django.core.management import call_command

    OpeningHours.objects.all().delete()
    OpeningHours.objects.create(
        weekday=0,
        opens_at=time(10, 30),
        closes_at=time(21, 0),
        is_closed=False,
    )
    OpeningHours.objects.create(
        weekday=1,
        opens_at=None,
        closes_at=None,
        is_closed=True,
    )

    call_command("seed_reservations")

    monday = OpeningHours.objects.get(weekday=0)
    assert monday.opens_at == time(10, 30)
    assert monday.closes_at == time(21, 0)
    assert monday.is_closed is False

    tuesday = OpeningHours.objects.get(weekday=1)
    assert tuesday.opens_at is None
    assert tuesday.closes_at is None
    assert tuesday.is_closed is True

    # Missing weekdays are created from the official schedule.
    assert OpeningHours.objects.filter(weekday=2).exists()


@pytest.mark.django_db
def test_seed_does_not_modify_production_ready():
    from django.core.management import call_command

    config = ReservationSettings.load()
    config.production_ready = True
    config.save()
    call_command("seed_reservations")
    assert ReservationSettings.load().production_ready is True


@pytest.mark.django_db
def test_seed_force_hours_overwrites_with_official_schedule():
    from django.core.management import call_command

    from reservations.official_hours import OFFICIAL_OPENING_HOURS

    OpeningHours.objects.update_or_create(
        weekday=5,
        defaults={"opens_at": time(8, 0), "closes_at": time(16, 0), "is_closed": False},
    )
    call_command("seed_reservations", force_hours=True)
    saturday = OpeningHours.objects.get(weekday=5)
    opens, closes, closed = OFFICIAL_OPENING_HOURS[5]
    assert saturday.opens_at == opens
    assert saturday.closes_at == closes
    assert saturday.is_closed is closed


def _next_weekday(weekday: int, min_days: int = 2) -> date:
    d = date.today() + timedelta(days=min_days)
    while d.weekday() != weekday:
        d += timedelta(days=1)
    return d


def _apply_official_hours():
    from reservations.official_hours import OFFICIAL_OPENING_HOURS

    for weekday, (opens, closes, closed) in OFFICIAL_OPENING_HOURS.items():
        OpeningHours.objects.update_or_create(
            weekday=weekday,
            defaults={"opens_at": opens, "closes_at": closes, "is_closed": closed},
        )
    config = ReservationSettings.load()
    config.production_ready = True
    config.save()


@pytest.mark.django_db
def test_hours_endpoint_returns_official_schedule(api):
    from reservations.official_hours import OFFICIAL_OPENING_HOURS

    _apply_official_hours()
    resp = api.get("/api/v1/hours/")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == 7
    by_day = {row["weekday"]: row for row in body}
    for weekday, (opens, closes, closed) in OFFICIAL_OPENING_HOURS.items():
        row = by_day[weekday]
        assert row["is_closed"] is closed
        assert row["opens_at"] == opens.strftime("%H:%M:%S")
        assert row["closes_at"] == closes.strftime("%H:%M:%S")


@pytest.mark.django_db
@pytest.mark.parametrize(
    "weekday,opens,closes,outside",
    [
        (0, time(10, 30), time(21, 0), time(9, 0)),  # Monday
        (1, time(10, 30), time(21, 0), time(9, 0)),  # Tuesday
        (2, time(10, 30), time(21, 0), time(9, 0)),  # Wednesday
        (3, time(10, 30), time(21, 0), time(9, 0)),  # Thursday
        (4, time(11, 30), time(0, 0), time(10, 0)),  # Friday (midnight close)
        (5, time(10, 30), time(23, 0), time(9, 0)),  # Saturday
        (6, time(10, 30), time(21, 0), time(9, 0)),  # Sunday
    ],
)
def test_official_hours_availability_and_boundaries(api, weekday, opens, closes, outside):
    """Each official weekday: first slot = open, close not bookable, outside absent."""
    from reservations.availability import generate_slots

    _apply_official_hours()
    config = ReservationSettings.load()
    buffer = config.last_seating_buffer_minutes
    interval = config.slot_interval_minutes

    expected_slots = generate_slots(opens, closes, interval, buffer)
    assert expected_slots[0] == opens
    assert closes not in expected_slots
    assert outside not in expected_slots

    target = _next_weekday(weekday)
    avail = api.get(f"/api/v1/reservations/availability/?date={target.isoformat()}")
    assert avail.status_code == 200
    body = avail.json()
    assert body["closed"] is False
    slot_times = [s["time"] for s in body["slots"]]
    assert opens.strftime("%H:%M") in slot_times
    assert closes.strftime("%H:%M") not in slot_times
    assert outside.strftime("%H:%M") not in slot_times


@pytest.mark.django_db
def test_official_hours_create_accepts_open_rejects_outside(api):
    """Single create-path check (avoids throttling from per-weekday POSTs)."""
    _apply_official_hours()
    target = _next_weekday(0)  # Monday
    ok = api.post(
        "/api/v1/reservations/",
        {
            "name": "Anna",
            "phone": "0701234567",
            "email": "anna-hours@example.com",
            "party_size": 2,
            "date": target.isoformat(),
            "time": "10:30",
        },
        format="json",
    )
    assert ok.status_code == 201

    before = Reservation.objects.count()
    bad = api.post(
        "/api/v1/reservations/",
        {
            "name": "Bertil",
            "phone": "0707654321",
            "email": "bertil-hours@example.com",
            "party_size": 2,
            "date": target.isoformat(),
            "time": "09:00",
        },
        format="json",
    )
    assert bad.status_code in (400, 409)
    assert bad.json()["code"] in {"invalid_slot", "closed"}
    assert Reservation.objects.count() == before


@pytest.mark.django_db
def test_friday_midnight_close_includes_late_evening_slots(api):
    _apply_official_hours()
    friday = _next_weekday(4)
    avail = api.get(f"/api/v1/reservations/availability/?date={friday.isoformat()}")
    times = [s["time"] for s in avail.json()["slots"]]
    assert "11:30" in times
    assert "23:00" in times
    assert "00:00" not in times
    assert "10:30" not in times


@pytest.mark.django_db
def test_sunday_2026_09_06_open_with_official_hours(api, settings):
    """Regression: Sunday 2026-09-06 is weekday 6, open 10:30–21:00.

    production_ready=False must yield enabled=False without closed=True.
    """
    from unittest.mock import patch

    from reservations.official_hours import OFFICIAL_OPENING_HOURS

    settings.DEBUG = False
    _apply_official_hours()
    config = ReservationSettings.load()
    config.production_ready = False
    config.save()

    sunday = date(2026, 9, 6)
    assert sunday.weekday() == 6
    opens, closes, closed = OFFICIAL_OPENING_HOURS[6]
    assert closed is False
    assert opens == time(10, 30)
    assert closes == time(21, 0)

    hours_api = api.get("/api/v1/hours/")
    sunday_row = next(r for r in hours_api.json() if r["weekday"] == 6)
    assert sunday_row["is_closed"] is False
    assert sunday_row["opens_at"].startswith("10:30")
    assert sunday_row["closes_at"].startswith("21:00")

    # Pin both calendar date and clock. Patching only localdate is not enough:
    # same-day lead-time uses localtime(), and CI running on 2026-09-06 would
    # otherwise filter morning slots against the real wall clock.
    from datetime import datetime
    from zoneinfo import ZoneInfo

    pinned_morning = datetime(2026, 9, 5, 8, 0, tzinfo=ZoneInfo("Europe/Stockholm"))
    with (
        patch("reservations.availability.timezone.localdate", return_value=date(2026, 9, 5)),
        patch("reservations.availability.timezone.localtime", return_value=pinned_morning),
    ):
        avail = api.get(
            "/api/v1/reservations/availability/?date=2026-09-06&party_size=2"
        )
    assert avail.status_code == 200
    body = avail.json()
    assert body["date"] == "2026-09-06"
    assert body["closed"] is False
    assert body["enabled"] is False
    times = [s["time"] for s in body["slots"]]
    assert "10:30" in times
    assert "20:00" in times or "20:30" in times
    assert "21:00" not in times


@pytest.mark.django_db
def test_open_day_production_ready_false_is_not_restaurant_closed(api, settings):
    """Bookings disabled ≠ restaurant closed."""
    settings.DEBUG = False
    _apply_official_hours()
    config = ReservationSettings.load()
    config.production_ready = False
    config.save()

    target = _next_weekday(0)  # Monday — always open in official schedule
    resp = api.get(f"/api/v1/reservations/availability/?date={target.isoformat()}")
    body = resp.json()
    assert body["closed"] is False
    assert body["enabled"] is False
    assert len(body["slots"]) > 0

    create = api.post(
        "/api/v1/reservations/",
        {
            "name": "Anna",
            "phone": "0700000000",
            "email": "anna-guard@example.com",
            "party_size": 2,
            "date": target.isoformat(),
            "time": "12:00",
        },
        format="json",
    )
    assert create.status_code == 503
    assert create.json()["code"] == "not_enabled"


@pytest.mark.django_db
def test_genuine_closed_weekday_reports_closed_true(api, settings):
    """An intentional closed weekday must still return closed=true."""
    settings.DEBUG = False
    _apply_official_hours()
    config = ReservationSettings.load()
    config.production_ready = False
    config.save()

    OpeningHours.objects.filter(weekday=2).update(
        opens_at=None, closes_at=None, is_closed=True
    )
    target = _next_weekday(2)
    body = api.get(
        f"/api/v1/reservations/availability/?date={target.isoformat()}"
    ).json()
    assert body["closed"] is True
    assert body["enabled"] is False
    assert body["slots"] == []


@pytest.mark.django_db
def test_availability_reads_same_opening_hours_as_hours_api(api, settings):
    """Hours endpoint and availability must share OpeningHours rows."""
    from datetime import datetime
    from unittest.mock import patch
    from zoneinfo import ZoneInfo

    settings.DEBUG = False
    _apply_official_hours()
    config = ReservationSettings.load()
    config.production_ready = False
    config.save()

    hours_rows = {r["weekday"]: r for r in api.get("/api/v1/hours/").json()}
    # Pin calendar "today" and clock so same-day lead-time does not empty slots.
    pinned = date(2026, 9, 1)
    morning = datetime(2026, 9, 1, 8, 0, tzinfo=ZoneInfo("Europe/Stockholm"))
    with (
        patch("reservations.availability.timezone.localdate", return_value=pinned),
        patch("reservations.availability.timezone.localtime", return_value=morning),
    ):
        for weekday in range(7):
            target = pinned
            while target.weekday() != weekday:
                target += timedelta(days=1)
            avail = api.get(
                f"/api/v1/reservations/availability/?date={target.isoformat()}"
            ).json()
            row = hours_rows[weekday]
            if row["is_closed"] or row["opens_at"] is None:
                assert avail["closed"] is True
                assert avail["slots"] == []
            else:
                assert avail["closed"] is False
                assert avail["enabled"] is False
                assert avail["slots"][0]["time"] == row["opens_at"][:5]


@pytest.mark.django_db
def test_date_query_not_timezone_shifted_to_wrong_weekday(api, settings):
    """ISO date query is a calendar date; it is not converted via timezone."""
    from unittest.mock import patch

    from reservations.availability import opening_for_date

    settings.DEBUG = False
    _apply_official_hours()
    config = ReservationSettings.load()
    config.production_ready = False
    config.save()

    sunday = date(2026, 9, 6)
    assert sunday.weekday() == 6

    is_open, opens_at, closes_at = opening_for_date(sunday)
    assert is_open is True
    assert opens_at == time(10, 30)
    assert closes_at == time(21, 0)

    # Even if "now" is interpreted in UTC, the requested YYYY-MM-DD stays Sunday.
    # Pin localtime as well so same-day lead-time cannot strip morning slots
    # when CI runs on the real 2026-09-06 calendar day.
    from datetime import datetime
    from zoneinfo import ZoneInfo

    pinned_morning = datetime(2026, 9, 5, 8, 0, tzinfo=ZoneInfo("Europe/Stockholm"))
    with (
        patch(
            "reservations.availability.timezone.localdate",
            return_value=date(2026, 9, 5),
        ),
        patch(
            "reservations.availability.timezone.localtime",
            return_value=pinned_morning,
        ),
    ):
        body = api.get(
            "/api/v1/reservations/availability/?date=2026-09-06&party_size=2"
        ).json()
    assert body["date"] == "2026-09-06"
    assert body["closed"] is False
    assert body["enabled"] is False
    assert body["slots"][0]["time"] == "10:30"

@pytest.mark.django_db
def test_placeholder_hours_report_closed_not_merely_disabled(api, settings):
    """Uninitialized OpeningHours → restaurant closed, not only booking-off."""
    settings.DEBUG = False
    OpeningHours.objects.all().delete()
    for weekday in range(7):
        OpeningHours.objects.create(
            weekday=weekday, opens_at=None, closes_at=None, is_closed=True
        )
    config = ReservationSettings.load()
    config.production_ready = False
    config.save()

    target = _next_weekday(6)  # Sunday
    body = api.get(
        f"/api/v1/reservations/availability/?date={target.isoformat()}"
    ).json()
    assert body["closed"] is True
    assert body["enabled"] is False
    assert body["slots"] == []
