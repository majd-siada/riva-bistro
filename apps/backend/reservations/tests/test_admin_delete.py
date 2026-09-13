from datetime import date, time, timedelta

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from reservations.models import Reservation

User = get_user_model()


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def staff(api):
    user = User.objects.create_user("chef", password="hemligt123", is_staff=True)
    api.force_login(user)
    return user


def _booking(**kwargs):
    defaults = {
        "name": "Anna",
        "phone": "0700000000",
        "email": "anna@example.com",
        "party_size": 2,
        "date": date.today() + timedelta(days=3),
        "time": time(18, 0),
        "status": Reservation.Status.CONFIRMED,
    }
    defaults.update(kwargs)
    return Reservation.objects.create(**defaults)


@pytest.mark.django_db
def test_delete_reservation_requires_auth(api):
    row = _booking()
    resp = api.delete(f"/api/v1/admin/reservations/{row.pk}/")
    assert resp.status_code in (401, 403)
    assert Reservation.objects.filter(pk=row.pk).exists()


@pytest.mark.django_db
def test_delete_reservation(api, staff):
    row = _booking()
    resp = api.delete(f"/api/v1/admin/reservations/{row.pk}/")
    assert resp.status_code == 204
    assert not Reservation.objects.filter(pk=row.pk).exists()


@pytest.mark.django_db
def test_bulk_delete_reservations(api, staff):
    a = _booking(name="A", email="a@example.com")
    b = _booking(name="B", email="b@example.com")
    keep = _booking(name="Keep", email="keep@example.com")
    resp = api.post(
        "/api/v1/admin/reservations/bulk-delete/",
        {"ids": [a.pk, b.pk]},
        format="json",
    )
    assert resp.status_code == 200
    assert resp.json()["deleted"] == 2
    assert not Reservation.objects.filter(pk__in=[a.pk, b.pk]).exists()
    assert Reservation.objects.filter(pk=keep.pk).exists()


@pytest.mark.django_db
def test_bulk_delete_rejects_empty(api, staff):
    resp = api.post("/api/v1/admin/reservations/bulk-delete/", {"ids": []}, format="json")
    assert resp.status_code == 400
