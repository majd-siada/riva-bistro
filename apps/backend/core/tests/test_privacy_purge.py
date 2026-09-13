"""Tests for 30-day personal-data purge (integritetspolicy alignment)."""

from __future__ import annotations

from datetime import date, time, timedelta

import pytest
from django.core.management import call_command
from django.utils import timezone

from core.models import ContactMessage, EventInquiry
from core.privacy_purge import (
    REDACTED_EMAIL,
    REDACTED_NAME,
    purge_personal_data,
    retention_cutoff_date,
)
from reservations.models import Reservation


def _past(days: int) -> date:
    return timezone.localdate() - timedelta(days=days)


def _future(days: int) -> date:
    return timezone.localdate() + timedelta(days=days)


def _booking(*, on: date, name: str = "Anna", email: str = "anna@example.com") -> Reservation:
    return Reservation.objects.create(
        name=name,
        phone="0700000000",
        email=email,
        party_size=2,
        date=on,
        time=time(18, 0),
        special_request="Fönsterbord",
        status=Reservation.Status.CONFIRMED,
    )


@pytest.mark.django_db
def test_purge_scrubs_old_reservation_keeps_ops_fields():
    old = _booking(on=_past(31))
    result = purge_personal_data()
    assert result.reservations_scrubbed == 1
    old.refresh_from_db()
    assert old.name == REDACTED_NAME
    assert old.email == REDACTED_EMAIL
    assert old.phone == ""
    assert old.special_request == ""
    assert old.ref.startswith("RB-")
    assert old.party_size == 2
    assert old.date == _past(31)
    assert old.status == Reservation.Status.CONFIRMED


@pytest.mark.django_db
def test_purge_boundary_and_future():
    """date == cutoff is eligible; date == cutoff+1 day and future are not."""
    on_cutoff = _booking(on=retention_cutoff_date(), email="edge@example.com")
    still_within = _booking(on=_past(29), email="within@example.com")
    future = _booking(on=_future(5), email="future@example.com")

    result = purge_personal_data()
    assert result.reservations_scrubbed == 1

    on_cutoff.refresh_from_db()
    still_within.refresh_from_db()
    future.refresh_from_db()
    assert on_cutoff.email == REDACTED_EMAIL
    assert still_within.email == "within@example.com"
    assert future.email == "future@example.com"

@pytest.mark.django_db
def test_purge_deletes_old_contacts_and_events():
    old_c = ContactMessage.objects.create(
        name="Erik", email="erik@example.com", message="Hej"
    )
    ContactMessage.objects.filter(pk=old_c.pk).update(
        created_at=timezone.now() - timedelta(days=40)
    )
    old_e = EventInquiry.objects.create(
        name="Bolag", email="event@bolag.se", message="Fest"
    )
    EventInquiry.objects.filter(pk=old_e.pk).update(
        created_at=timezone.now() - timedelta(days=40)
    )
    fresh = ContactMessage.objects.create(
        name="Ny", email="ny@example.com", message="Idag"
    )

    result = purge_personal_data()
    assert result.contacts_deleted == 1
    assert result.events_deleted == 1
    assert not ContactMessage.objects.filter(pk=old_c.pk).exists()
    assert not EventInquiry.objects.filter(pk=old_e.pk).exists()
    assert ContactMessage.objects.filter(pk=fresh.pk).exists()


@pytest.mark.django_db
def test_purge_idempotent():
    _booking(on=_past(40), email="once@example.com")
    first = purge_personal_data()
    second = purge_personal_data()
    assert first.reservations_scrubbed == 1
    assert second.reservations_scrubbed == 0


@pytest.mark.django_db
def test_purge_dry_run_makes_no_changes():
    row = _booking(on=_past(45), email="dry@example.com")
    result = purge_personal_data(dry_run=True)
    assert result.reservations_scrubbed == 1
    row.refresh_from_db()
    assert row.email == "dry@example.com"


@pytest.mark.django_db
def test_management_command_runs(capsys):
    _booking(on=_past(50), email="cmd@example.com")
    call_command("purge_personal_data")
    out = capsys.readouterr().out
    assert "reservations_scrubbed=1" in out
