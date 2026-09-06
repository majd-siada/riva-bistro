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
TOP_LEVEL_SECTIONS = [
    (10, "dagens-lunch", "Dagens lunch v.??"),
    (20, "rivas-meny", "RIVAS MENY"),
    (30, "take-away", "TAKE AWAY"),
    (40, "stora-sallskapsmeny", "STORA SÄLLSKAPSMENY"),
    (50, "snacks-drinkar", "SNACKS & DRINKAR"),
    (60, "dryck", "DRYCK"),
]

# Existing course-type categories that belong under RIVAS MENY.
RIVAS_MENY_CHILDREN = (
    "forratter",
    "varmratter",
    "sallader",
    "pasta",
    "barnmeny",
    "desserter",
)


class Command(BaseCommand):
    help = (
        "Seed six top-level menu sections and nest course categories under "
        "RIVAS MENY (idempotent; does not reset admin ordering or invent items)."
    )

    def handle(self, *args, **options):
        created_sections = 0
        for sort_order, slug, name in TOP_LEVEL_SECTIONS:
            _, created = Category.objects.get_or_create(
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
                self.stdout.write(f"Created section {slug} (sort_order={sort_order})")
            else:
                self.stdout.write(f"Section {slug} already exists — leaving name/order intact")

        rivas = Category.objects.filter(slug="rivas-meny").first()
        if rivas is None:
            self.stderr.write(self.style.ERROR("rivas-meny missing after seed"))
            return

        linked = 0
        for child_slug in RIVAS_MENY_CHILDREN:
            child = Category.objects.filter(slug=child_slug).first()
            if child is None:
                self.stdout.write(
                    self.style.WARNING(
                        f"Course category {child_slug} not found — skip parent link "
                        "(run seed_menu first if expected)."
                    )
                )
                continue
            if child.parent_id != rivas.id:
                child.parent = rivas
                child.save(update_fields=["parent", "updated_at"])
                linked += 1
                self.stdout.write(f"Linked {child_slug} → rivas-meny")
            else:
                self.stdout.write(f"{child_slug} already under rivas-meny")

        self.stdout.write(
            self.style.SUCCESS(
                f"Menu sections ready (created={created_sections}, linked={linked})."
            )
        )
