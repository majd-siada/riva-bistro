import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from core.models import ContactMessage, EventInquiry

User = get_user_model()


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def staff(api):
    user = User.objects.create_user("chef", password="hemligt123", is_staff=True)
    api.force_login(user)
    return user


@pytest.mark.django_db
def test_delete_contact_message(api, staff):
    row = ContactMessage.objects.create(
        name="Erik",
        email="erik@example.com",
        message="Hej",
    )
    resp = api.delete(f"/api/v1/admin/inquiries/contact/{row.pk}/")
    assert resp.status_code == 204
    assert not ContactMessage.objects.filter(pk=row.pk).exists()


@pytest.mark.django_db
def test_delete_event_inquiry(api, staff):
    row = EventInquiry.objects.create(
        name="Bolag",
        email="event@bolag.se",
        message="Vi vill boka",
    )
    resp = api.delete(f"/api/v1/admin/inquiries/events/{row.pk}/")
    assert resp.status_code == 204
    assert not EventInquiry.objects.filter(pk=row.pk).exists()


@pytest.mark.django_db
def test_bulk_delete_contacts(api, staff):
    a = ContactMessage.objects.create(name="A", email="a@ex.com", message="1")
    b = ContactMessage.objects.create(name="B", email="b@ex.com", message="2")
    keep = ContactMessage.objects.create(name="Keep", email="k@ex.com", message="3")
    resp = api.post(
        "/api/v1/admin/inquiries/bulk-delete/",
        {"kind": "contact", "ids": [a.pk, b.pk]},
        format="json",
    )
    assert resp.status_code == 200
    assert resp.json()["deleted"] == 2
    assert ContactMessage.objects.filter(pk=keep.pk).exists()


@pytest.mark.django_db
def test_bulk_delete_events(api, staff):
    a = EventInquiry.objects.create(name="A", email="a@ex.com", message="1")
    b = EventInquiry.objects.create(name="B", email="b@ex.com", message="2")
    resp = api.post(
        "/api/v1/admin/inquiries/bulk-delete/",
        {"kind": "event", "ids": [a.pk, b.pk]},
        format="json",
    )
    assert resp.status_code == 200
    assert resp.json()["deleted"] == 2
    assert EventInquiry.objects.count() == 0


@pytest.mark.django_db
def test_bulk_delete_requires_auth(api):
    resp = api.post(
        "/api/v1/admin/inquiries/bulk-delete/",
        {"kind": "contact", "ids": [1]},
        format="json",
    )
    assert resp.status_code in (401, 403)
