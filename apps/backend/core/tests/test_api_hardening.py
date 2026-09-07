"""API hardening behavioral tests beyond scoped throttles alone."""

from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient

from core.models import NewsItem

User = get_user_model()

ADMIN_PATHS_GET = [
    "/api/v1/admin/menu/products/",
    "/api/v1/admin/menu/categories/",
    "/api/v1/admin/reservations/",
    "/api/v1/admin/hours/",
    "/api/v1/admin/settings/",
    "/api/v1/admin/news/",
    "/api/v1/admin/gallery/",
    "/api/v1/admin/inquiries/contact/",
    "/api/v1/admin/inquiries/events/",
]


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def staff_user(db):
    return User.objects.create_user("harden_chef", password="hemligt123", is_staff=True)


@pytest.fixture
def non_staff_user(db):
    return User.objects.create_user("harden_guest", password="hemligt123", is_staff=False)


@pytest.mark.django_db
@pytest.mark.parametrize("path", ADMIN_PATHS_GET)
def test_admin_gets_require_authentication(api, path):
    resp = api.get(path)
    assert resp.status_code in (401, 403), path


@pytest.mark.django_db
def test_non_staff_cannot_read_admin_surfaces(api, non_staff_user):
    api.force_authenticate(user=non_staff_user)
    for path in ADMIN_PATHS_GET:
        resp = api.get(path)
        assert resp.status_code == 403, path


@pytest.mark.django_db
def test_non_staff_cannot_write_admin_news(api, non_staff_user):
    api.force_authenticate(user=non_staff_user)
    resp = api.post(
        "/api/v1/admin/news/",
        {"title": "Nope", "slug": "nope", "body": "x", "is_published": False},
        format="json",
    )
    assert resp.status_code == 403


@pytest.mark.django_db
def test_staff_can_read_admin_news(api, staff_user):
    api.force_authenticate(user=staff_user)
    resp = api.get("/api/v1/admin/news/")
    assert resp.status_code == 200


@pytest.mark.django_db
@pytest.mark.parametrize(
    "path",
    [
        "/api/v1/menu/categories/",
        "/api/v1/menu/products/",
        "/api/v1/hours/",
        "/api/v1/news/",
        "/api/v1/gallery/",
        "/api/v1/health/",
    ],
)
def test_public_get_resources_reject_post(api, path):
    resp = api.post(path, {}, format="json")
    assert resp.status_code == 405, path


@pytest.mark.django_db
def test_unpublished_news_not_in_public_list(api):
    NewsItem.objects.create(
        title="Draft",
        slug="draft-secret",
        body="secret body",
        is_published=False,
    )
    NewsItem.objects.create(
        title="Live",
        slug="live-ok",
        body="public",
        is_published=True,
        published_at=timezone.now(),
    )
    resp = api.get("/api/v1/news/")
    assert resp.status_code == 200
    payloads = resp.json()
    slugs = {row.get("slug") for row in payloads}
    assert "live-ok" in slugs
    assert "draft-secret" not in slugs
    bodies = " ".join(str(row) for row in payloads)
    assert "secret body" not in bodies


@pytest.mark.django_db
def test_contact_validation_error_has_no_traceback(api):
    resp = api.post(
        "/api/v1/contact/",
        {"name": "", "email": "bad", "message": ""},
        format="json",
    )
    assert resp.status_code == 400
    body = resp.json()
    blob = str(body).lower()
    assert "traceback" not in blob
    assert "django.core" not in blob
    assert isinstance(body, dict)


@pytest.mark.django_db
def test_reservation_validation_error_predictable(api):
    resp = api.post(
        "/api/v1/reservations/",
        {"name": "", "email": "x", "phone": "", "party_size": 0},
        format="json",
    )
    assert resp.status_code == 400
    body = resp.json()
    assert "traceback" not in str(body).lower()
