"""Behavioral throttle coverage for scoped write endpoints."""

from __future__ import annotations

import copy

import pytest
from django.conf import settings
from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APIClient
from rest_framework.throttling import ScopedRateThrottle


@pytest.fixture(autouse=True)
def _clear_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.mark.django_db
def test_auth_login_throttle_returns_429(monkeypatch):
    framework = copy.deepcopy(settings.REST_FRAMEWORK)
    rates = {
        **framework.get("DEFAULT_THROTTLE_RATES", {}),
        "auth": "2/min",
    }
    framework["DEFAULT_THROTTLE_RATES"] = rates
    # DRF caches THROTTLE_RATES on the class at import time — patch explicitly.
    monkeypatch.setattr(ScopedRateThrottle, "THROTTLE_RATES", rates)

    client = APIClient()
    payload = {"username": "nobody", "password": "wrong-password"}
    with override_settings(REST_FRAMEWORK=framework):
        statuses = [
            client.post("/api/v1/admin/auth/login/", payload, format="json").status_code
            for _ in range(3)
        ]
    assert statuses[0] != 429
    assert statuses[1] != 429
    assert statuses[2] == 429, statuses


@pytest.mark.django_db
def test_auth_throttle_rate_is_configured():
    rates = settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]
    assert "auth" in rates
    assert "reservations" in rates
    assert "inquiries" in rates
    assert "anon" in rates


@pytest.mark.django_db
def test_reservations_throttle_returns_429(monkeypatch):
    framework = copy.deepcopy(settings.REST_FRAMEWORK)
    rates = {
        **framework.get("DEFAULT_THROTTLE_RATES", {}),
        "reservations": "2/min",
    }
    framework["DEFAULT_THROTTLE_RATES"] = rates
    monkeypatch.setattr(ScopedRateThrottle, "THROTTLE_RATES", rates)

    client = APIClient()
    payload = {
        "name": "Throttle Test",
        "email": "throttle@example.com",
        "phone": "+46701234567",
        "party_size": 2,
        "date": "2099-01-01",
        "time": "18:00",
    }
    with override_settings(REST_FRAMEWORK=framework):
        statuses = [
            client.post("/api/v1/reservations/", payload, format="json").status_code
            for _ in range(3)
        ]
    # First two may be 400 (validation/closed) but must not be 429; third is throttled.
    assert statuses[0] != 429
    assert statuses[1] != 429
    assert statuses[2] == 429, statuses
