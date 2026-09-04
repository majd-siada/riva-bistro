"""Smoke tests for Phase 1 foundation."""

from __future__ import annotations

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_health_endpoint_ok() -> None:
    client = APIClient()
    response = client.get(reverse("health"))

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "ok"
    assert response.json()["service"] == "riva-bistro-backend"
    assert response.json()["database"] == "ok"


@pytest.mark.django_db
def test_openapi_schema_requires_staff() -> None:
    client = APIClient()
    response = client.get("/api/v1/schema/", HTTP_ACCEPT="application/json")
    assert response.status_code == status.HTTP_403_FORBIDDEN
