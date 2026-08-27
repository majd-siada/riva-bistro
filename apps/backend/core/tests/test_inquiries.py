import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api():
    return APIClient()


@pytest.mark.django_db
def test_contact_sends_email(api, settings, mailoutbox):
    settings.RESTAURANT_NOTIFICATION_EMAIL = "inbox@example.com"
    resp = api.post(
        "/api/v1/contact/",
        {"name": "Erik", "email": "erik@example.com", "message": "Hej, en fråga."},
        format="json",
    )
    assert resp.status_code == 200
    assert len(mailoutbox) == 1
    assert mailoutbox[0].to == ["inbox@example.com"]
    assert mailoutbox[0].reply_to == ["erik@example.com"]


@pytest.mark.django_db
def test_contact_without_recipient_returns_error(api, settings, mailoutbox):
    settings.RESTAURANT_NOTIFICATION_EMAIL = ""
    resp = api.post(
        "/api/v1/contact/",
        {"name": "Erik", "email": "erik@example.com", "message": "Hej, en fråga."},
        format="json",
    )
    assert resp.status_code == 502
    assert len(mailoutbox) == 0


@pytest.mark.django_db
def test_event_inquiry_sends_email(api, settings, mailoutbox):
    settings.RESTAURANT_NOTIFICATION_EMAIL = "inbox@example.com"
    resp = api.post(
        "/api/v1/events/inquiry/",
        {
            "name": "Bolag AB",
            "email": "event@bolag.se",
            "guests": "20",
            "message": "Vi vill boka för 20 personer.",
        },
        format="json",
    )
    assert resp.status_code == 200
    assert len(mailoutbox) == 1
    assert "20" in mailoutbox[0].body


@pytest.mark.django_db
def test_contact_validation_error(api):
    resp = api.post(
        "/api/v1/contact/",
        {"name": "", "email": "not-an-email", "message": ""},
        format="json",
    )
    assert resp.status_code == 400
