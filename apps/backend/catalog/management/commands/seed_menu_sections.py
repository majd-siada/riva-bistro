"""Idempotent seed for the six top-level menu sections + RIVAS MENY nesting.

Creates (or leaves alone) top-level categories by slug. On first create only,
sets name/sort_order. Never overwrites an administrator's name or sort_order.
Links existing course-type categories under rivas-meny without moving products.
Does not invent menu items.
"""

from __future__ import annotations

from django.core.management.base import BaseCommand

from catalog.models import Category

# (sort_order, slug, name) — gaps allow future inserts without renumbering.
# Week number for dagens lunch is set in Admin (do not invent v.NN here).
TOP_LEVEL_SECTIONS = [
    (10, "dagens-lunch", "Dagens lunch"),
    (20, "rivas-meny", "RIVAS MENY"),
    (30, "take-away", "TAKE AWAY"),
    (40, "stora-sallskapsmeny", "STORA SÄLLSKAPSMENY"),
    (50, "snacks-drinkar", "SNACKS & DRINKAR"),
    (60, "dryck", "DRYCK"),
]

# Names from earlier seeds that should be upgraded once (not admin edits).
LEGACY_SECTION_NAMES = {
    "dagens-lunch": ("Dagens lunch v.??",),
}

# Existing course-type categories that belong under RIVAS MENY.
RIVAS_MENY_CHILDREN = (
    "forratter",
    "varmratter",
    "sallader",
    "pasta",
    "barnmeny",
    "desserter",
)


def ensure_menu_sections() -> dict[str, int]:
    """Create missing top-level section shells and nest known RIVAS courses.

    Safe to call from management commands and the admin API.
    """
    created_sections = 0
    upgraded_names = 0
    for sort_order, slug, name in TOP_LEVEL_SECTIONS:
        obj, created = Category.objects.get_or_create(
            slug=slug,
            defaults={
                "name": name,
                "description": "",
                "sort_order": sort_order,
                "is_active": True,
                "parent": None,
            },
        )
        if created:
            created_sections += 1
        else:
            legacy = LEGACY_SECTION_NAMES.get(slug, ())
            if obj.name in legacy and obj.name != name:
                obj.name = name
                obj.save(update_fields=["name", "updated_at"])
                upgraded_names += 1

    linked = 0
    rivas = Category.objects.filter(slug="rivas-meny").first()
    if rivas is not None:
        for child_slug in RIVAS_MENY_CHILDREN:
            child = Category.objects.filter(slug=child_slug).first()
            if child is None:
                continue
            if child.parent_id != rivas.id:
                child.parent = rivas
                child.save(update_fields=["parent", "updated_at"])
                linked += 1

    return {
        "created_sections": created_sections,
        "upgraded_names": upgraded_names,
        "linked": linked,
    }


class Command(BaseCommand):
    help = (
        "Seed six top-level menu sections and nest course categories under "
        "RIVAS MENY (idempotent; does not reset admin ordering or invent items)."
    )

    def handle(self, *args, **options):
        result = ensure_menu_sections()
        for _sort_order, slug, _name in TOP_LEVEL_SECTIONS:
            if Category.objects.filter(slug=slug).exists():
                self.stdout.write(f"Section {slug} ready")

        if Category.objects.filter(slug="rivas-meny").first() is None:
            self.stderr.write(self.style.ERROR("rivas-meny missing after seed"))
            return

        self.stdout.write(
            self.style.SUCCESS(
                "Menu sections ready "
                f"(created={result['created_sections']}, "
                f"upgraded_names={result['upgraded_names']}, "
                f"linked={result['linked']})."
            )
        )
