"""Per-section admin CRUD → public sync acceptance for all six meny tabs."""

from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.core.management import call_command
from rest_framework.test import APIClient

from catalog.management.commands.seed_menu_sections import TOP_LEVEL_SECTIONS
from catalog.models import Category, Product

User = get_user_model()

SECTION_SLUGS = [slug for _, slug, _ in TOP_LEVEL_SECTIONS]

# Flat sections hold products on the section root; RIVAS MENY uses a course child.
PRODUCT_CATEGORY_BY_SECTION = {
    "dagens-lunch": "dagens-lunch",
    "rivas-meny": "forratter",
    "take-away": "take-away",
    "stora-sallskapsmeny": "stora-sallskapsmeny",
    "snacks-drinkar": "snacks-drinkar",
    "dryck": "dryck",
}


@pytest.fixture
def seeded_menu(db):
    call_command("seed_menu")
    call_command("seed_menu_sections")


@pytest.fixture
def staff_client(seeded_menu):
    user = User.objects.create_user("menu-staff", password="x", is_staff=True)
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def public_client(seeded_menu):
    return APIClient()


def _create_payload(category_id: int, name: str, sort_order: int = 10) -> dict:
    return {
        "category": category_id,
        "name": name,
        "description": f"Test description for {name}",
        "base_price": "100.00",
        "vat_rate": "0.12",
        "sort_order": sort_order,
        "is_available": True,
        "is_featured": False,
        "featured_order": 0,
    }


@pytest.mark.django_db
@pytest.mark.parametrize("section_slug", SECTION_SLUGS)
def test_admin_product_lifecycle_syncs_to_public_per_section(
    staff_client, public_client, section_slug
):
    category_slug = PRODUCT_CATEGORY_BY_SECTION[section_slug]
    category = Category.objects.get(slug=category_slug)
    name = f"Coverage test {section_slug}"

    create = staff_client.post(
        "/api/v1/admin/menu/products/",
        _create_payload(category.id, name, sort_order=42),
        format="json",
    )
    assert create.status_code == 201, create.content
    product_id = create.json()["id"]
    product_slug = create.json()["slug"]
    assert Product.objects.filter(pk=product_id, category=category).exists()

    public_items = public_client.get(f"/api/v1/menu/categories/{category_slug}/items/")
    assert public_items.status_code == 200
    by_slug = {row["slug"]: row for row in public_items.json()}
    assert product_slug in by_slug
    assert by_slug[product_slug]["name"] == name

    admin_get = staff_client.get(f"/api/v1/admin/menu/products/{product_id}/")
    assert admin_get.status_code == 200
    assert admin_get.json()["sort_order"] == 42

    renamed = f"{name} edited"
    update = staff_client.patch(
        f"/api/v1/admin/menu/products/{product_id}/",
        {"name": renamed, "sort_order": 7, "is_available": True},
        format="json",
    )
    assert update.status_code == 200, update.content
    assert update.json()["sort_order"] == 7

    public_after_edit = public_client.get(
        f"/api/v1/menu/categories/{category_slug}/items/"
    )
    by_slug = {row["slug"]: row for row in public_after_edit.json()}
    assert by_slug[product_slug]["name"] == renamed

    # Public list is ordered by sort_order; a lower value should appear first
    # among products we control in this category for flat empty sections.
    peer = staff_client.post(
        "/api/v1/admin/menu/products/",
        _create_payload(category.id, f"{name} peer", sort_order=99),
        format="json",
    )
    assert peer.status_code == 201, peer.content
    peer_id = peer.json()["id"]
    peer_slug = peer.json()["slug"]
    ordered = public_client.get(f"/api/v1/menu/categories/{category_slug}/items/")
    slugs = [row["slug"] for row in ordered.json()]
    assert slugs.index(product_slug) < slugs.index(peer_slug)

    hide = staff_client.patch(
        f"/api/v1/admin/menu/products/{product_id}/",
        {"is_available": False},
        format="json",
    )
    assert hide.status_code == 200
    hidden_items = public_client.get(f"/api/v1/menu/categories/{category_slug}/items/")
    assert product_slug not in {row["slug"] for row in hidden_items.json()}

    show = staff_client.patch(
        f"/api/v1/admin/menu/products/{product_id}/",
        {"is_available": True},
        format="json",
    )
    assert show.status_code == 200
    shown_items = public_client.get(f"/api/v1/menu/categories/{category_slug}/items/")
    assert product_slug in {row["slug"] for row in shown_items.json()}

    delete = staff_client.delete(f"/api/v1/admin/menu/products/{product_id}/")
    assert delete.status_code == 204
    assert not Product.objects.filter(pk=product_id).exists()
    staff_client.delete(f"/api/v1/admin/menu/products/{peer_id}/")
    after_delete = public_client.get(f"/api/v1/menu/categories/{category_slug}/items/")
    assert product_slug not in {row["slug"] for row in after_delete.json()}
    assert peer_slug not in {row["slug"] for row in after_delete.json()}


@pytest.mark.django_db
@pytest.mark.parametrize("section_slug", SECTION_SLUGS)
def test_inactive_section_hidden_from_public_categories(
    staff_client, public_client, section_slug
):
    section = Category.objects.get(slug=section_slug)
    assert section.is_active is True

    before = public_client.get("/api/v1/menu/categories/")
    assert section_slug in {row["slug"] for row in before.json()}

    deactivate = staff_client.patch(
        f"/api/v1/admin/menu/categories/{section.id}/",
        {"is_active": False},
        format="json",
    )
    assert deactivate.status_code == 200, deactivate.content

    after = public_client.get("/api/v1/menu/categories/")
    assert section_slug not in {row["slug"] for row in after.json()}

    # Restore so later parametrized cases / DB state stay clean.
    restore = staff_client.patch(
        f"/api/v1/admin/menu/categories/{section.id}/",
        {"is_active": True},
        format="json",
    )
    assert restore.status_code == 200


@pytest.mark.django_db
def test_public_products_exclude_inactive_category(seeded_menu):
    """Products under inactive categories must not appear on public product lists."""
    from rest_framework.test import APIClient

    course = Category.objects.get(slug="forratter")
    course.is_active = False
    course.save(update_fields=["is_active", "updated_at"])

    client = APIClient()
    products = client.get("/api/v1/menu/products/")
    assert products.status_code == 200
    assert all(row["category_slug"] != "forratter" for row in products.json())

    featured = client.get("/api/v1/menu/featured/")
    assert featured.status_code == 200
    assert all(row["category_slug"] != "forratter" for row in featured.json())


@pytest.mark.django_db
def test_admin_create_duplicate_product_name_gets_unique_slug(staff_client):
    """Creating a dish whose slugify(name) already exists must not 500."""
    category = Category.objects.get(slug="forratter")
    first = staff_client.post(
        "/api/v1/admin/menu/products/",
        _create_payload(category.id, "Torskfilé", sort_order=50),
        format="json",
    )
    assert first.status_code == 201, first.content
    assert first.json()["slug"] == "torskfile"

    duplicate = staff_client.post(
        "/api/v1/admin/menu/products/",
        _create_payload(category.id, "Torskfilé", sort_order=51),
        format="json",
    )
    assert duplicate.status_code == 201, duplicate.content
    body = duplicate.json()
    assert body["name"] == "Torskfilé"
    assert body["slug"] == "torskfile-2"

    update = staff_client.patch(
        f"/api/v1/admin/menu/products/{body['id']}/",
        {"description": "Updated after duplicate create", "sort_order": 52},
        format="json",
    )
    assert update.status_code == 200, update.content
    assert update.json()["slug"] == "torskfile-2"
    assert update.json()["description"] == "Updated after duplicate create"

    staff_client.delete(f"/api/v1/admin/menu/products/{first.json()['id']}/")
    staff_client.delete(f"/api/v1/admin/menu/products/{body['id']}/")
