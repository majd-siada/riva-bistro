"""Tests for on-demand frontend revalidation helpers and auth endpoint."""

from __future__ import annotations

import pytest
from django.db import transaction
from rest_framework.test import APIClient

from core.revalidate import schedule_frontend_revalidation, trigger_frontend_revalidation


@pytest.fixture
def api():
    return APIClient()


@pytest.mark.django_db(transaction=True)
def test_revalidate_auth_accepts_matching_bearer(api, monkeypatch):
    monkeypatch.setenv("FRONTEND_REVALIDATE_SECRET", "test-revalidate-secret")
    resp = api.post(
        "/api/v1/revalidate-auth/",
        HTTP_AUTHORIZATION="Bearer test-revalidate-secret",
    )
    assert resp.status_code == 200
    assert resp.json()["ok"] is True


@pytest.mark.django_db(transaction=True)
def test_revalidate_auth_rejects_wrong_bearer(api, monkeypatch):
    monkeypatch.setenv("FRONTEND_REVALIDATE_SECRET", "test-revalidate-secret")
    resp = api.post(
        "/api/v1/revalidate-auth/",
        HTTP_AUTHORIZATION="Bearer wrong",
    )
    assert resp.status_code == 401


def test_trigger_skipped_when_unset(monkeypatch):
    monkeypatch.delenv("FRONTEND_REVALIDATE_URL", raising=False)
    monkeypatch.delenv("FRONTEND_REVALIDATE_SECRET", raising=False)
    assert trigger_frontend_revalidation(["/meny"]) is False


@pytest.mark.django_db(transaction=True)
def test_schedule_runs_after_commit(monkeypatch):
    calls: list[list[str] | None] = []

    def fake(paths=None):
        calls.append(paths)
        return True

    monkeypatch.setattr("core.revalidate.trigger_frontend_revalidation", fake)
    with transaction.atomic():
        schedule_frontend_revalidation(["/", "/meny"])
        assert calls == []
    assert calls == [["/", "/meny"]]
