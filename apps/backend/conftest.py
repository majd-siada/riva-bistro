import os

import pytest
from django.core.cache import cache

os.environ.setdefault("DJANGO_SECRET_KEY", "pytest-secret-not-for-production")


@pytest.fixture(autouse=True)
def _relax_drf_throttles(settings):
    """Avoid LocMem throttle flakes across the full suite (view-scoped rates included)."""
    rates = dict(settings.REST_FRAMEWORK.get("DEFAULT_THROTTLE_RATES") or {})
    settings.REST_FRAMEWORK = {
        **settings.REST_FRAMEWORK,
        "DEFAULT_THROTTLE_RATES": {key: "10000/min" for key in rates},
    }
    cache.clear()
