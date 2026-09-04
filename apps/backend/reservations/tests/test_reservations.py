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
        "/api/v1/reservations/", {**base, "name": "A", "party_size": 4}, format="json"
    )
    assert first.status_code == 201
    # Slot is now full; a further guest must be rejected at the backend.
    second = api.post(
        "/api/v1/reservations/",
        {**base, "name": "B", "email": "b@example.com", "party_size": 1},
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
            "phone": "07",
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
            "name": "X",
            "phone": "07",
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

    resp = api.post(
        "/api/v1/reservations/",
        {
            "name": "Anna",
            "phone": "07",
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
            "phone": "07",
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
            "phone": "07",
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
