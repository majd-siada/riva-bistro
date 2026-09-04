"""Media serving and upload sniff tests."""

from __future__ import annotations

import sys
from decimal import Decimal
from pathlib import Path

import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import clear_url_caches
from rest_framework.test import APIClient

from catalog.models import Category, Product
from core.images import sniff_image_kind

User = get_user_model()


def _reload_urls() -> None:
    clear_url_caches()
    sys.modules.pop("config.urls", None)
    import config.urls  # noqa: F401


def test_sniff_image_kind_accepts_jpeg_png_webp():
    jpeg = SimpleUploadedFile(
        "a.jpg", b"\xff\xd8\xff\xe0" + b"\x00" * 12, content_type="application/octet-stream"
    )
    assert sniff_image_kind(jpeg) == "jpeg"

    png = SimpleUploadedFile(
        "a.png", b"\x89PNG\r\n\x1a\n" + b"\x00" * 8, content_type="application/octet-stream"
    )
    assert sniff_image_kind(png) == "png"

    webp = SimpleUploadedFile(
        "a.webp", b"RIFF\x00\x00\x00\x00WEBP" + b"\x00" * 4, content_type="application/octet-stream"
    )
    assert sniff_image_kind(webp) == "webp"


def test_sniff_image_kind_rejects_non_image():
    fake = SimpleUploadedFile("evil.jpg", b"not-an-image", content_type="image/jpeg")
    assert sniff_image_kind(fake) is None


@pytest.mark.django_db
def test_media_served_when_debug_false_and_media_serve(settings, tmp_path):
    settings.DEBUG = False
    settings.MEDIA_SERVE = True
    settings.MEDIA_ROOT = tmp_path
    settings.MEDIA_URL = "/media/"
    settings.ALLOWED_HOSTS = ["testserver", "localhost", "127.0.0.1"]
    (Path(tmp_path) / "probe.txt").write_text("ok", encoding="utf-8")
    _reload_urls()

    client = APIClient()
    resp = client.get("/media/probe.txt")
    assert resp.status_code == 200
    body = b"".join(resp.streaming_content) if hasattr(resp, "streaming_content") else resp.content
    assert b"ok" in body


@pytest.mark.django_db
def test_media_not_served_when_media_serve_disabled(settings, tmp_path):
    settings.DEBUG = False
    settings.MEDIA_SERVE = False
    settings.MEDIA_ROOT = tmp_path
    settings.ALLOWED_HOSTS = ["testserver", "localhost", "127.0.0.1"]
    (Path(tmp_path) / "hidden.txt").write_text("secret", encoding="utf-8")
    _reload_urls()

    client = APIClient()
    resp = client.get("/media/hidden.txt")
    assert resp.status_code == 404


@pytest.mark.django_db
def test_product_image_upload_rejects_fake_magic():
    staff = User.objects.create_user("chef", password="hemligt123", is_staff=True)
    category = Category.objects.create(name="Test", slug="test", sort_order=1)
    product = Product.objects.create(
        category=category,
        name="Dish",
        slug="dish",
        base_price=Decimal("100.00"),
        vat_rate=Decimal("0.12"),
    )
    client = APIClient()
    client.force_authenticate(user=staff)
    fake = SimpleUploadedFile("dish.jpg", b"definitely-not-jpeg", content_type="image/jpeg")
    resp = client.post(
        f"/api/v1/admin/menu/products/{product.pk}/image/",
        {"image": fake},
        format="multipart",
    )
    assert resp.status_code == 400
    detail = resp.json()["detail"].lower()
    assert "giltig" in detail or "jpg" in detail or "webp" in detail
