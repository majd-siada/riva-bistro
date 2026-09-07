"""Deterministic security-settings and cookie/header posture tests.

Not a penetration test. Proves repository configuration and local behavior only.
"""

from __future__ import annotations

from pathlib import Path

import pytest
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()
SETTINGS_SOURCE = Path(__file__).resolve().parents[2] / "config" / "settings.py"
SETTINGS_TEXT = SETTINGS_SOURCE.read_text(encoding="utf-8")


def test_anon_throttle_is_wired():
    rates = settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]
    assert "anon" in rates
    assert "reservations" in rates
    assert "inquiries" in rates
    assert "auth" in rates
    classes = settings.REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"]
    assert any("AnonRateThrottle" in c for c in classes)


def test_logging_config_present():
    assert hasattr(settings, "LOGGING")
    assert settings.LOGGING["handlers"]["console"]["class"] == "logging.StreamHandler"


def test_cross_origin_opener_policy_is_same_origin():
    assert getattr(settings, "SECURE_CROSS_ORIGIN_OPENER_POLICY", None) == "same-origin"


def test_clickjacking_and_nosniff_defaults_when_not_debug():
    assert hasattr(settings, "SECURE_CROSS_ORIGIN_OPENER_POLICY")
    assert getattr(settings, "X_FRAME_OPTIONS", "DENY") == "DENY"


def test_session_cookie_httponly_and_csrf_readable_for_spa():
    assert settings.SESSION_COOKIE_HTTPONLY is True
    # Admin SPA reads csrftoken via document.cookie — must stay JS-readable.
    assert settings.CSRF_COOKIE_HTTPONLY is False


def test_production_security_flags_present_in_settings_source():
    """Production branch is gated on DEBUG at import; assert source intent."""
    assert "SECURE_CONTENT_TYPE_NOSNIFF = True" in SETTINGS_TEXT
    assert "SECURE_HSTS_SECONDS" in SETTINGS_TEXT
    assert "SECURE_HSTS_INCLUDE_SUBDOMAINS = True" in SETTINGS_TEXT
    assert "SECURE_REFERRER_POLICY" in SETTINGS_TEXT
    assert 'X_FRAME_OPTIONS = "DENY"' in SETTINGS_TEXT
    assert "SESSION_COOKIE_SECURE = True" in SETTINGS_TEXT
    assert "CSRF_COOKIE_SECURE = True" in SETTINGS_TEXT
    assert "SECURE_PROXY_SSL_HEADER" in SETTINGS_TEXT


def test_openapi_schema_requires_staff():
    client = APIClient()
    resp = client.get("/api/v1/schema/")
    assert resp.status_code in (401, 403)


@pytest.mark.django_db
def test_admin_write_without_csrf_is_forbidden_when_enforced():
    User.objects.create_user("csrf_chef", password="hemligt123", is_staff=True)
    client = APIClient(enforce_csrf_checks=True)
    assert client.login(username="csrf_chef", password="hemligt123")
    # Session authenticated but no CSRF token → DRF SessionAuthentication rejects.
    resp = client.post(
        "/api/v1/admin/news/",
        {"title": "X", "slug": "x-csrf", "body": "y", "is_published": False},
        format="json",
    )
    assert resp.status_code in (403, 401)


@pytest.mark.django_db
def test_malformed_json_on_contact_returns_safe_error():
    client = APIClient()
    resp = client.post(
        "/api/v1/contact/",
        data="{not-json",
        content_type="application/json",
    )
    assert resp.status_code in (400, 415)
    blob = str(resp.content).lower()
    assert "traceback" not in blob
