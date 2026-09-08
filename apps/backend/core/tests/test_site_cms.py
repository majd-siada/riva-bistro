"""Tests for RestaurantProfile, SiteContent, and Offer APIs."""

from __future__ import annotations

from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient

from core.models import Offer, RestaurantProfile, SiteContent


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def staff(db):
    User = get_user_model()
    return User.objects.create_user(
        username="cms-staff", password="x", is_staff=True, is_superuser=True
    )


@pytest.mark.django_db
def test_public_restaurant_and_site_content(api):
    RestaurantProfile.load()
    SiteContent.load()
    r = api.get("/api/v1/restaurant/")
    assert r.status_code == 200
    assert r.json()["name"] == "Riva Bistro"
    s = api.get("/api/v1/site-content/")
    assert s.status_code == 200
    assert "hero_title" in s.json()
    assert "hero_src" in s.json()


@pytest.mark.django_db
def test_admin_restaurant_requires_staff(api, staff):
    assert api.patch("/api/v1/admin/restaurant/", {"phone": "011"}, format="json").status_code in (
        401,
        403,
    )
    api.force_authenticate(user=staff)
    resp = api.patch("/api/v1/admin/restaurant/", {"phone": "087042050"}, format="json")
    assert resp.status_code == 200
    assert resp.json()["phone"] == "087042050"


@pytest.mark.django_db
def test_admin_site_content_patch(api, staff):
    api.force_authenticate(user=staff)
    resp = api.patch(
        "/api/v1/admin/site-content/",
        {"hero_title": "Test hero"},
        format="json",
    )
    assert resp.status_code == 200
    assert resp.json()["hero_title"] == "Test hero"
    assert SiteContent.load().hero_title == "Test hero"


@pytest.mark.django_db
def test_offer_public_filters_inactive_and_expired(api, staff):
    now = timezone.now()
    Offer.objects.create(title="Active", is_active=True, sort_order=1)
    Offer.objects.create(title="Off", is_active=False, sort_order=2)
    Offer.objects.create(
        title="Expired",
        is_active=True,
        starts_at=now - timedelta(days=10),
        ends_at=now - timedelta(days=1),
        sort_order=3,
    )
    Offer.objects.create(
        title="Future",
        is_active=True,
        starts_at=now + timedelta(days=2),
        sort_order=4,
    )
    public = api.get("/api/v1/offers/")
    assert public.status_code == 200
    titles = {row["title"] for row in public.json()}
    assert titles == {"Active"}

    api.force_authenticate(user=staff)
    created = api.post(
        "/api/v1/admin/offers/",
        {"title": "Lunch deal", "is_active": True, "price_label": "129 kr"},
        format="json",
    )
    assert created.status_code == 201
    pk = created.json()["id"]
    assert api.delete(f"/api/v1/admin/offers/{pk}/").status_code == 204


@pytest.mark.django_db
def test_offer_rejects_inverted_dates(api, staff):
    api.force_authenticate(user=staff)
    now = timezone.now()
    resp = api.post(
        "/api/v1/admin/offers/",
        {
            "title": "Bad",
            "starts_at": (now + timedelta(days=5)).isoformat(),
            "ends_at": now.isoformat(),
            "is_active": True,
        },
        format="json",
    )
    assert resp.status_code == 400
