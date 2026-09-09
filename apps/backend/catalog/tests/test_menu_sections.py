"""Menu section hierarchy — six top-level sections + RIVAS MENY nesting."""

from __future__ import annotations

import pytest
from django.core.management import call_command
from rest_framework.test import APIClient

from catalog.management.commands.seed_menu_sections import TOP_LEVEL_SECTIONS
from catalog.models import Category, Product

SECTION_SLUGS = [slug for _, slug, _ in TOP_LEVEL_SECTIONS]
COURSE_SLUGS = [
    "forratter",
    "varmratter",
    "sallader",
    "pasta",
    "barnmeny",
    "desserter",
]


@pytest.fixture
def seeded_menu(db):
    call_command("seed_menu")
    call_command("seed_menu_sections")


@pytest.mark.django_db
def test_six_top_level_sections_exist_with_stable_sort_order(seeded_menu):
    tops = {
        c.slug: c
        for c in Category.objects.filter(parent__isnull=True, is_active=True)
    }
    for sort_order, slug, name in TOP_LEVEL_SECTIONS:
        assert slug in tops
        assert tops[slug].sort_order == sort_order
        # Name is only set on create; after first seed it matches.
        assert tops[slug].name == name


@pytest.mark.django_db
def test_course_categories_parented_under_rivas_meny(seeded_menu):
    rivas = Category.objects.get(slug="rivas-meny")
    for slug in COURSE_SLUGS:
        child = Category.objects.get(slug=slug)
        assert child.parent_id == rivas.id


@pytest.mark.django_db
def test_existing_products_preserved_and_single_category(seeded_menu):
    assert Product.objects.count() == 33
    for product in Product.objects.select_related("category"):
        assert product.category_id is not None
        assert product.category.slug in COURSE_SLUGS


@pytest.mark.django_db
def test_category_items_endpoint_is_exact_category_only(seeded_menu):
    client = APIClient()

    takeaway = client.get("/api/v1/menu/categories/take-away/items/")
    assert takeaway.status_code == 200
    assert takeaway.json() == []

    dryck = client.get("/api/v1/menu/categories/dryck/items/")
    assert dryck.status_code == 200
    assert dryck.json() == []

    forratter = client.get("/api/v1/menu/categories/forratter/items/")
    assert forratter.status_code == 200
    payload = forratter.json()
    assert len(payload) == 5
    assert all(item["category_slug"] == "forratter" for item in payload)

    rivas_items = client.get("/api/v1/menu/categories/rivas-meny/items/")
    assert rivas_items.status_code == 200
    assert rivas_items.json() == []


@pytest.mark.django_db
def test_category_detail_and_list_include_parent_fields(seeded_menu):
    client = APIClient()
    listing = client.get("/api/v1/menu/categories/")
    assert listing.status_code == 200
    rows = listing.json()
    assert {row["slug"] for row in rows}.issuperset(set(SECTION_SLUGS) | set(COURSE_SLUGS))

    top_slugs = [row["slug"] for row in rows if row["parent"] is None]
    assert top_slugs[:2] == ["dagens-lunch", "rivas-meny"]

    detail = client.get("/api/v1/menu/categories/forratter/")
    assert detail.status_code == 200
    body = detail.json()
    assert body["slug"] == "forratter"
    assert body["parent_slug"] == "rivas-meny"
    assert body["sort_order"] is not None


@pytest.mark.django_db
def test_missing_category_slug_returns_404(seeded_menu):
    client = APIClient()
    assert client.get("/api/v1/menu/categories/does-not-exist/").status_code == 404
    assert client.get("/api/v1/menu/categories/does-not-exist/items/").status_code == 404


@pytest.mark.django_db
def test_seed_menu_sections_is_idempotent_and_preserves_admin_order(seeded_menu):
    dryck = Category.objects.get(slug="dryck")
    dryck.sort_order = 55
    dryck.name = "DRYCK (admin)"
    dryck.save(update_fields=["sort_order", "name", "updated_at"])

    call_command("seed_menu_sections")
    call_command("seed_menu_sections")

    dryck.refresh_from_db()
    assert dryck.sort_order == 55
    assert dryck.name == "DRYCK (admin)"
    assert Category.objects.filter(slug__in=SECTION_SLUGS).count() == 6


@pytest.mark.django_db
def test_seed_menu_sections_upgrades_placeholder_dagens_lunch_name(seeded_menu):
    lunch = Category.objects.get(slug="dagens-lunch")
    lunch.name = "Dagens lunch v.??"
    lunch.save(update_fields=["name", "updated_at"])

    call_command("seed_menu_sections")

    lunch.refresh_from_db()
    assert lunch.name == "Dagens lunch"


@pytest.mark.django_db
def test_seed_menu_sections_does_not_overwrite_custom_dagens_lunch_name(seeded_menu):
    lunch = Category.objects.get(slug="dagens-lunch")
    lunch.name = "Dagens lunch v.36"
    lunch.save(update_fields=["name", "updated_at"])

    call_command("seed_menu_sections")

    lunch.refresh_from_db()
    assert lunch.name == "Dagens lunch v.36"


@pytest.mark.django_db
def test_seed_menu_does_not_prune_top_level_sections(seeded_menu):
    before = set(
        Category.objects.filter(slug__in=SECTION_SLUGS).values_list("slug", flat=True)
    )
    assert before == set(SECTION_SLUGS)
    call_command("seed_menu")
    after = set(
        Category.objects.filter(slug__in=SECTION_SLUGS).values_list("slug", flat=True)
    )
    assert after == set(SECTION_SLUGS)
    assert Product.objects.count() == 33


@pytest.mark.django_db
def test_admin_ensure_sections_creates_missing_rivas_meny(db):
    """Admin Meny can recover when section shells were never seeded."""
    from django.contrib.auth import get_user_model

    assert not Category.objects.filter(slug="rivas-meny").exists()

    user = get_user_model().objects.create_user("ensure-staff", password="x", is_staff=True)
    client = APIClient()
    client.force_authenticate(user=user)

    resp = client.post("/api/v1/admin/menu/ensure-sections/")
    assert resp.status_code == 200
    body = resp.json()
    assert body["ok"] is True
    assert body["created_sections"] >= 1
    assert Category.objects.filter(slug="rivas-meny", parent__isnull=True).exists()
    assert set(
        Category.objects.filter(slug__in=SECTION_SLUGS).values_list("slug", flat=True)
    ) == set(SECTION_SLUGS)
