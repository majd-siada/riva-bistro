import pytest
from rest_framework.test import APIClient

from core.models import ContactMessage, EventInquiry


@pytest.fixture
def api():
    return APIClient()


@pytest.mark.django_db
def test_contact_persists_and_sends_email(api, settings, mailoutbox):
    settings.RESTAURANT_NOTIFICATION_EMAIL = "inbox@example.com"
    resp = api.post(
        "/api/v1/contact/",
        {"name": "Erik", "email": "erik@example.com", "message": "Hej, en fråga."},
        format="json",
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "received"
    assert ContactMessage.objects.count() == 1
    assert any("inbox@example.com" in m.to for m in mailoutbox)
    assert any("erik@example.com" in m.to for m in mailoutbox)


@pytest.mark.django_db
def test_contact_without_inbox_still_persists(api, settings, mailoutbox):
    settings.RESTAURANT_NOTIFICATION_EMAIL = ""
    resp = api.post(
        "/api/v1/contact/",
        {"name": "Erik", "email": "erik@example.com", "message": "Hej, en fråga."},
        format="json",
    )
    assert resp.status_code == 200
    assert ContactMessage.objects.filter(email_sent=False).exists()
    assert all("inbox@example.com" not in m.to for m in mailoutbox)


@pytest.mark.django_db
def test_event_inquiry_persists(api, settings, mailoutbox):
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
    assert EventInquiry.objects.count() == 1
    assert any("20" in m.body for m in mailoutbox)


@pytest.mark.django_db
def test_contact_validation_error(api):
    resp = api.post(
        "/api/v1/contact/",
        {"name": "", "email": "not-an-email", "message": ""},
        format="json",
    )
    assert resp.status_code == 400


@pytest.mark.django_db
def test_news_empty_list(api):
    resp = api.get("/api/v1/news/")
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.django_db
def test_gallery_public_list(api):
    from core.models import GalleryItem

    GalleryItem.objects.create(
        title="Matsalen",
        alt="Interiör",
        image_url="/scenes/home-interior.jpg",
        is_published=True,
    )
    GalleryItem.objects.create(
        title="Dold",
        alt="Dold",
        image_url="/scenes/hero-food.jpg",
        is_published=False,
    )
    resp = api.get("/api/v1/gallery/")
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["src"] == "/scenes/home-interior.jpg"
