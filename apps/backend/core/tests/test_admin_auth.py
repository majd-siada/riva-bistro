import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api():
    return APIClient()


@pytest.mark.django_db
def test_admin_endpoint_requires_auth(api):
    resp = api.get("/api/v1/admin/menu/products/")
    assert resp.status_code in (401, 403)


@pytest.mark.django_db
def test_login_success_and_me(api):
    User.objects.create_user("chef", password="hemligt123", is_staff=True)
    login = api.post(
        "/api/v1/admin/auth/login/",
        {"username": "chef", "password": "hemligt123"},
        format="json",
    )
    assert login.status_code == 200
    assert login.json()["authenticated"] is True

    me = api.get("/api/v1/admin/auth/me/")
    assert me.json()["authenticated"] is True

    # Authenticated staff can now reach a protected endpoint.
    products = api.get("/api/v1/admin/menu/products/")
    assert products.status_code == 200


@pytest.mark.django_db
def test_login_rejects_non_staff(api):
    User.objects.create_user("gast", password="hemligt123", is_staff=False)
    resp = api.post(
        "/api/v1/admin/auth/login/",
        {"username": "gast", "password": "hemligt123"},
        format="json",
    )
    assert resp.status_code == 403


@pytest.mark.django_db
def test_login_wrong_password(api):
    User.objects.create_user("chef", password="hemligt123", is_staff=True)
    resp = api.post(
        "/api/v1/admin/auth/login/",
        {"username": "chef", "password": "fel"},
        format="json",
    )
    assert resp.status_code == 401
