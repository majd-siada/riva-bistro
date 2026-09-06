"""Tests for post-commit reservation staff notifications."""

from __future__ import annotations

from datetime import date, time, timedelta
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from rest_framework.test import APIClient

from reservations.models import OpeningHours, Reservation, ReservationSettings


def _open_all_week() -> None:
    for weekday in range(7):
        OpeningHours.objects.update_or_create(
            weekday=weekday,
            defaults={
                "opens_at": time(11, 0),
                "closes_at": time(22, 0),
                "is_closed": False,
            },
        )
    config = ReservationSettings.load()
    config.production_ready = True
    config.save()


def _payload(**overrides):
    target = date.today() + timedelta(days=2)
    base = {
        "name": "Anna Andersson",
        "phone": "0701234567",
        "email": "anna@example.com",
        "party_size": 2,
        "date": target.isoformat(),
        "time": "12:00",
    }
    base.update(overrides)
    return base


@pytest.fixture
def api():
    return APIClient()


@pytest.mark.django_db
def test_successful_reservation_triggers_notification_services(
    api, settings, django_capture_on_commit_callbacks
):
    settings.DEBUG = False
    _open_all_week()
    with (
        patch(
            "core.notifications.reservation.send_telegram_message",
            return_value=True,
        ) as telegram,
        patch(
            "core.notifications.reservation.send_staff_reservation_email",
            return_value=True,
        ) as email,
        django_capture_on_commit_callbacks(execute=True),
    ):
        resp = api.post("/api/v1/reservations/", _payload(), format="json")
    assert resp.status_code == 201
    assert Reservation.objects.count() == 1
    row = Reservation.objects.get()
    assert row.telegram_notified is True
    assert row.staff_email_notified is True
    telegram.assert_called_once()
    email.assert_called_once()
    text = telegram.call_args.args[0]
    assert "Riva Bistro" in text
    assert "New reservation" in text
    assert row.ref in text
    assert "Anna Andersson" in text
    assert "0701234567" in text
    assert "anna@example.com" in text


@pytest.mark.django_db
def test_telegram_failure_does_not_cancel_reservation(
    api, settings, django_capture_on_commit_callbacks
):
    settings.DEBUG = False
    _open_all_week()
    with (
        patch(
            "core.notifications.reservation.send_telegram_message",
            side_effect=RuntimeError("telegram down"),
        ),
        patch(
            "core.notifications.reservation.send_staff_reservation_email",
            return_value=True,
        ),
        django_capture_on_commit_callbacks(execute=True),
    ):
        resp = api.post("/api/v1/reservations/", _payload(), format="json")
    assert resp.status_code == 201
    assert Reservation.objects.count() == 1
    row = Reservation.objects.get()
    assert row.telegram_notified is False
    assert row.staff_email_notified is True


@pytest.mark.django_db
def test_email_failure_does_not_cancel_reservation(
    api, settings, django_capture_on_commit_callbacks
):
    settings.DEBUG = False
    _open_all_week()
    with (
        patch(
            "core.notifications.reservation.send_telegram_message",
            return_value=True,
        ),
        patch(
            "core.notifications.reservation.send_staff_reservation_email",
            side_effect=RuntimeError("mail down"),
        ),
        django_capture_on_commit_callbacks(execute=True),
    ):
        resp = api.post("/api/v1/reservations/", _payload(), format="json")
    assert resp.status_code == 201
    assert Reservation.objects.count() == 1
    row = Reservation.objects.get()
    assert row.telegram_notified is True
    assert row.staff_email_notified is False


@pytest.mark.django_db
def test_notifications_not_called_when_creation_fails(
    api, settings, django_capture_on_commit_callbacks
):
    settings.DEBUG = False
    _open_all_week()
    config = ReservationSettings.load()
    config.production_ready = False
    config.save()
    with (
        patch(
            "core.notifications.reservation.send_telegram_message",
            return_value=True,
        ) as telegram,
        patch(
            "core.notifications.reservation.send_staff_reservation_email",
            return_value=True,
        ) as email,
        django_capture_on_commit_callbacks(execute=True),
    ):
        resp = api.post("/api/v1/reservations/", _payload(), format="json")
    assert resp.status_code == 503
    assert resp.json()["code"] == "not_enabled"
    assert Reservation.objects.count() == 0
    telegram.assert_not_called()
    email.assert_not_called()


@pytest.mark.django_db
def test_production_ready_false_still_blocks_exactly_as_before(api, settings):
    settings.DEBUG = False
    _open_all_week()
    config = ReservationSettings.load()
    config.production_ready = False
    config.save()
    before = Reservation.objects.count()
    resp = api.post("/api/v1/reservations/", _payload(), format="json")
    assert resp.status_code == 503
    assert resp.json()["code"] == "not_enabled"
    assert Reservation.objects.count() == before


def test_notification_modules_have_no_hardcoded_credentials():
    from pathlib import Path

    root = Path(__file__).resolve().parents[2] / "core" / "notifications"
    for path in root.glob("*.py"):
        text = path.read_text()
        assert "123456:ABC" not in text
        if path.name == "telegram.py":
            assert "TELEGRAM_BOT_TOKEN" in text
            assert "TELEGRAM_CHAT_ID" in text
            # Must not call logger.exception (URL embeds token).
            assert "logger.exception(" not in text
        if path.name == "staff_email.py":
            assert "HOSTINGER_MAIL_API_TOKEN" in text
            assert "HOSTINGER_MAIL_MAILBOX_RESOURCE_ID" in text
            assert "Configuration(access_token=" in text


@pytest.mark.django_db
def test_idempotent_retry_does_not_double_notify(
    api, settings, django_capture_on_commit_callbacks
):
    settings.DEBUG = False
    _open_all_week()
    payload = _payload()
    with (
        patch(
            "core.notifications.reservation.send_telegram_message",
            return_value=True,
        ) as telegram,
        patch(
            "core.notifications.reservation.send_staff_reservation_email",
            return_value=True,
        ) as email,
        django_capture_on_commit_callbacks(execute=True),
    ):
        first = api.post("/api/v1/reservations/", payload, format="json")
        second = api.post("/api/v1/reservations/", payload, format="json")
    assert first.status_code == second.status_code == 201
    assert Reservation.objects.count() == 1
    assert telegram.call_count == 1
    assert email.call_count == 1


@pytest.mark.django_db
def test_duplicate_notify_call_claims_once():
    """Atomic claim prevents duplicate provider sends on double post-commit."""
    from core.notifications.reservation import notify_reservation_created

    _open_all_week()
    row = Reservation.objects.create(
        name="Clara",
        phone="0701112233",
        email="clara@example.com",
        party_size=2,
        date=date.today() + timedelta(days=3),
        time=time(13, 0),
        status=Reservation.Status.CONFIRMED,
    )
    with (
        patch(
            "core.notifications.reservation.send_telegram_message",
            return_value=True,
        ) as telegram,
        patch(
            "core.notifications.reservation.send_staff_reservation_email",
            return_value=True,
        ) as email,
    ):
        first = notify_reservation_created(row)
        second = notify_reservation_created(row)
    assert first == {"telegram": True, "email": True}
    assert second == {"telegram": False, "email": False}
    assert telegram.call_count == 1
    assert email.call_count == 1
    row.refresh_from_db()
    assert row.telegram_notified is True
    assert row.staff_email_notified is True


@pytest.mark.django_db
def test_failed_send_releases_claim_for_retry():
    from core.notifications.reservation import notify_reservation_created

    _open_all_week()
    row = Reservation.objects.create(
        name="Diana",
        phone="0702223344",
        email="diana@example.com",
        party_size=2,
        date=date.today() + timedelta(days=4),
        time=time(14, 0),
        status=Reservation.Status.CONFIRMED,
    )
    with (
        patch(
            "core.notifications.reservation.send_telegram_message",
            return_value=False,
        ),
        patch(
            "core.notifications.reservation.send_staff_reservation_email",
            return_value=False,
        ),
    ):
        result = notify_reservation_created(row)
    assert result == {"telegram": False, "email": False}
    row.refresh_from_db()
    assert row.telegram_notified is False
    assert row.staff_email_notified is False


def test_telegram_and_email_format_include_required_fields():
    from core.notifications.reservation import (
        format_reservation_email,
        format_reservation_telegram,
    )

    reservation = SimpleNamespace(
        ref="RB-TEST01",
        name="Bertil",
        phone="0709998877",
        email="bertil@example.com",
        date=date(2026, 9, 10),
        time=time(18, 30),
        party_size=4,
        special_request="Fönsterbord",
        get_status_display=lambda: "Bekräftad",
    )
    text = format_reservation_telegram(reservation)
    assert "Riva Bistro" in text
    assert "New reservation" in text
    assert "RB-TEST01" in text
    assert "Bertil" in text
    assert "0709998877" in text
    assert "bertil@example.com" in text
    assert "2026-09-10" in text
    assert "18:30" in text
    assert "4" in text
    assert "Bekräftad" in text

    subject, body, html = format_reservation_email(reservation)
    assert "RB-TEST01" in subject
    assert "Bertil" in body and "Bertil" in html
    assert "Fönsterbord" in body


def test_telegram_errors_do_not_log_token(settings, caplog):
    import logging

    from core.notifications import telegram as telegram_mod

    settings.TELEGRAM_BOT_TOKEN = "123456:SECRET-TOKEN-VALUE"
    settings.TELEGRAM_CHAT_ID = "999"
    with (
        patch(
            "core.notifications.telegram.urllib.request.urlopen",
            side_effect=telegram_mod.urllib.error.URLError("timed out"),
        ),
        caplog.at_level(logging.ERROR, logger="riva.notifications.telegram"),
    ):
        assert telegram_mod.send_telegram_message("hello") is False
    joined = " ".join(r.getMessage() for r in caplog.records)
    assert "SECRET-TOKEN-VALUE" not in joined
    assert "123456:" not in joined


def test_hostinger_api_failure_falls_back_to_django_smtp(settings):
    """When Hostinger is configured but the API fails, use Django EMAIL_*."""
    from core.notifications import staff_email as staff_email_mod

    settings.RESTAURANT_NOTIFICATION_EMAIL = "staff@rivabistro.se"
    settings.HOSTINGER_MAIL_API_TOKEN = "hostinger-token"
    settings.HOSTINGER_MAIL_MAILBOX_RESOURCE_ID = "mailbox-id"
    settings.DEFAULT_FROM_EMAIL = "noreply@rivabistro.se"

    with (
        patch.object(staff_email_mod, "_send_via_hostinger", return_value=False) as hostinger,
        patch.object(staff_email_mod, "_send_via_django", return_value=True) as django_send,
    ):
        ok = staff_email_mod.send_staff_reservation_email(
            subject="Test",
            text="body",
            html="<p>body</p>",
        )
    assert ok is True
    hostinger.assert_called_once()
    django_send.assert_called_once()
    assert django_send.call_args.kwargs["to"] == "staff@rivabistro.se"


def test_hostinger_success_skips_django_smtp(settings):
    from core.notifications import staff_email as staff_email_mod

    settings.RESTAURANT_NOTIFICATION_EMAIL = "staff@rivabistro.se"
    settings.HOSTINGER_MAIL_API_TOKEN = "hostinger-token"
    settings.HOSTINGER_MAIL_MAILBOX_RESOURCE_ID = "mailbox-id"

    with (
        patch.object(staff_email_mod, "_send_via_hostinger", return_value=True) as hostinger,
        patch.object(staff_email_mod, "_send_via_django", return_value=True) as django_send,
    ):
        ok = staff_email_mod.send_staff_reservation_email(
            subject="Test",
            text="body",
            html="<p>body</p>",
        )
    assert ok is True
    hostinger.assert_called_once()
    django_send.assert_not_called()


def test_incomplete_hostinger_uses_django_only(settings):
    from core.notifications import staff_email as staff_email_mod

    settings.RESTAURANT_NOTIFICATION_EMAIL = "staff@rivabistro.se"
    settings.HOSTINGER_MAIL_API_TOKEN = ""
    settings.HOSTINGER_MAIL_MAILBOX_RESOURCE_ID = ""

    with (
        patch.object(staff_email_mod, "_send_via_hostinger", return_value=True) as hostinger,
        patch.object(staff_email_mod, "_send_via_django", return_value=True) as django_send,
    ):
        ok = staff_email_mod.send_staff_reservation_email(
            subject="Test",
            text="body",
            html="<p>body</p>",
        )
    assert ok is True
    hostinger.assert_not_called()
    django_send.assert_called_once()
