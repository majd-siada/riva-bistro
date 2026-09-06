"""Throttle configuration smoke tests."""

from __future__ import annotations

from django.conf import settings


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
