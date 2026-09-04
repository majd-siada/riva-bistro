"""Public menu seed completeness — Förrätter + existing categories."""

from __future__ import annotations

from decimal import Decimal

import pytest
from django.core.management import call_command
from rest_framework.test import APIClient

from catalog.management.commands.seed_menu import CATEGORIES, PRODUCTS, ex_vat
from catalog.models import Category, Product
from catalog.pricing import price_from_ex_vat

EXPECTED_CATEGORY_SLUGS = [c[1] for c in CATEGORIES]
FORRATTER_PRODUCTS = {
    "toast-skagen-mediterranio": Decimal("95"),
    "vitloksgratinerade-bla-musslor": Decimal("90"),
    "raraka": Decimal("105"),
    "ost-chark-for-tva": Decimal("245"),
    "vitloksbrod": Decimal("49"),
}


@pytest.mark.django_db
def test_seed_menu_includes_forratter_and_existing_categories():
    call_command("seed_menu")

    categories = list(Category.objects.filter(is_active=True).order_by("sort_order"))
    slugs = [c.slug for c in categories]
    assert slugs == EXPECTED_CATEGORY_SLUGS
    assert slugs[0] == "forratter"
    assert Category.objects.get(slug="forratter").name == "Förrätter"
    assert Category.objects.get(slug="forratter").is_active is True

    for expected in ("varmratter", "sallader", "pasta", "barnmeny", "desserter"):
        assert expected in slugs


@pytest.mark.django_db
def test_seed_menu_forratter_products_exact_inc_vat_prices():
    call_command("seed_menu")

    for slug, expected_inc in FORRATTER_PRODUCTS.items():
        product = Product.objects.get(slug=slug)
        assert product.is_available is True
        assert product.category.slug == "forratter"
        pricing = price_from_ex_vat(
            Decimal(str(product.base_price)),
            Decimal(str(product.vat_rate)),
        )
        assert Decimal(pricing["price_inc_vat"]) == expected_inc.quantize(Decimal("0.01"))

    assert Product.objects.filter(category__slug="forratter").count() == 5


@pytest.mark.django_db
def test_public_menu_api_returns_forratter_and_prices():
    call_command("seed_menu")
    client = APIClient()

    categories = client.get("/api/v1/menu/categories/")
    assert categories.status_code == 200
    cat_slugs = [c["slug"] for c in categories.json()]
    assert cat_slugs[0] == "forratter"
    assert set(EXPECTED_CATEGORY_SLUGS).issubset(set(cat_slugs))

    products = client.get("/api/v1/menu/products/")
    assert products.status_code == 200
    by_slug = {p["slug"]: p for p in products.json()}
    for slug, expected_inc in FORRATTER_PRODUCTS.items():
        assert slug in by_slug
        assert by_slug[slug]["category_slug"] == "forratter"
        assert Decimal(by_slug[slug]["pricing"]["price_inc_vat"]) == expected_inc.quantize(
            Decimal("0.01")
        )


@pytest.mark.django_db
def test_seed_menu_ex_vat_roundtrip_matches_listed_inc_prices():
    """Seed stores ex-VAT so displayed inc-VAT matches the printed menu."""
    for _cat, _name, _slug, _desc, price_inc in PRODUCTS:
        if _cat != "forratter":
            continue
        pricing = price_from_ex_vat(ex_vat(price_inc), Decimal("0.12"))
        assert Decimal(pricing["price_inc_vat"]) == Decimal(price_inc).quantize(Decimal("0.01"))
