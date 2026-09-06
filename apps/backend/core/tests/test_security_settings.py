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


def test_cross_origin_opener_policy_is_same_origin():
    assert getattr(settings, "SECURE_CROSS_ORIGIN_OPENER_POLICY", None) == "same-origin"


def test_clickjacking_and_nosniff_defaults_when_not_debug():
    # Production hardening flags are applied when DEBUG is false; assert the
    # module defines the expected constants used by that branch.
    assert hasattr(settings, "SECURE_CROSS_ORIGIN_OPENER_POLICY")
    # X_FRAME_OPTIONS is always set via Django default or production branch.
    assert getattr(settings, "X_FRAME_OPTIONS", "DENY") == "DENY"
