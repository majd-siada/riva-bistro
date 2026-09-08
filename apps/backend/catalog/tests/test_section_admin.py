"""Django Admin registration for per-section menu management."""

from __future__ import annotations

from decimal import Decimal

import pytest
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import Client, RequestFactory

from catalog.models import Category, Product
from catalog.section_proxies import (
    MENU_SECTIONS,
    SECTION_ADMIN_MODELS,
    SECTION_SLUGS,
    TakeAwayCategory,
    TakeAwayProduct,
    section_category_q,
    section_product_q,
)


@pytest.fixture
def seeded_menu(db):
    call_command("seed_menu")
    call_command("seed_menu_sections")


@pytest.fixture
def admin_user(db):
    User = get_user_model()
    return User.objects.create_superuser(
        username="menu-admin",
        email="admin@example.com",
        password="test-pass-123",
    )


@pytest.fixture
def admin_client(admin_user):
    client = Client()
    assert client.login(username="menu-admin", password="test-pass-123")
    return client


@pytest.mark.django_db
def test_all_section_proxy_models_are_registered(seeded_menu):
    for slug in SECTION_SLUGS:
        meta = SECTION_ADMIN_MODELS[slug]
        assert admin.site.is_registered(meta["category_proxy"])
        assert admin.site.is_registered(meta["product_proxy"])


@pytest.mark.django_db
def test_section_filters_isolate_categories_and_products(seeded_menu):
    takeaway_cats = Category.objects.filter(section_category_q("take-away"))
    assert takeaway_cats.count() == 1
    assert takeaway_cats.get().slug == "take-away"

    rivas_cats = Category.objects.filter(section_category_q("rivas-meny"))
    slugs = set(rivas_cats.values_list("slug", flat=True))
    assert "rivas-meny" in slugs
    assert "forratter" in slugs
    assert "take-away" not in slugs

    rivas_products = Product.objects.filter(section_product_q("rivas-meny"))
    assert rivas_products.count() == 33
    assert Product.objects.filter(section_product_q("take-away")).count() == 0
    assert Product.objects.filter(section_product_q("dryck")).count() == 0


@pytest.mark.django_db
def test_take_away_admin_queryset_isolates_dishes(seeded_menu, admin_user):
    shell = Category.objects.get(slug="take-away")
    child = Category.objects.create(
        name="Burgare",
        slug="takeaway-burgare",
        parent=shell,
        sort_order=1,
        is_active=True,
    )
    Product.objects.create(
        category=child,
        name="Classic burger",
        slug="classic-burger",
        description="Test",
        base_price=Decimal("115.18"),
        vat_rate=Decimal("0.12"),
        sort_order=1,
        is_available=True,
        is_featured=False,
    )

    factory = RequestFactory()
    request = factory.get("/admin/")
    request.user = admin_user

    cat_admin = admin.site._registry[TakeAwayCategory]
    assert set(cat_admin.get_queryset(request).values_list("slug", flat=True)) == {
        "take-away",
        "takeaway-burgare",
    }

    prod_admin = admin.site._registry[TakeAwayProduct]
    qs = prod_admin.get_queryset(request)
    assert qs.count() == 1
    assert qs.get().slug == "classic-burger"


@pytest.mark.django_db
def test_section_admin_changelists_load(seeded_menu, admin_client):
    for slug, _name in MENU_SECTIONS:
        meta = SECTION_ADMIN_MODELS[slug]
        cat = meta["category_proxy"]
        prod = meta["product_proxy"]
        cat_url = f"/admin/catalog/{cat._meta.model_name}/"
        prod_url = f"/admin/catalog/{prod._meta.model_name}/"
        assert admin_client.get(cat_url).status_code == 200, cat_url
        assert admin_client.get(prod_url).status_code == 200, prod_url
