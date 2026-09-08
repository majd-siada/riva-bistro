"""Proxy models so each public meny section has its own Django Admin entries."""

from __future__ import annotations

from django.db.models import Q

from catalog.models import Category, Product

# (slug, Swedish admin label) — must match seed_menu_sections / public chips.
MENU_SECTIONS: tuple[tuple[str, str], ...] = (
    ("dagens-lunch", "Dagens lunch"),
    ("rivas-meny", "RIVAS MENY"),
    ("take-away", "TAKE AWAY"),
    ("stora-sallskapsmeny", "STORA SÄLLSKAPSMENY"),
    ("snacks-drinkar", "SNACKS & DRINKAR"),
    ("dryck", "DRYCK"),
)

SECTION_SLUGS: tuple[str, ...] = tuple(slug for slug, _ in MENU_SECTIONS)


def section_category_q(section_slug: str) -> Q:
    """Categories belonging to a top-level section (root + direct children)."""
    return Q(slug=section_slug, parent__isnull=True) | Q(parent__slug=section_slug)


def section_product_q(section_slug: str) -> Q:
    """Products in a section root or in that section's child categories."""
    return Q(category__slug=section_slug, category__parent__isnull=True) | Q(
        category__parent__slug=section_slug
    )


class DagensLunchCategory(Category):
    class Meta:
        proxy = True
        verbose_name = "Dagens lunch · kategori"
        verbose_name_plural = "Dagens lunch · kategorier"


class DagensLunchProduct(Product):
    class Meta:
        proxy = True
        verbose_name = "Dagens lunch · rätt"
        verbose_name_plural = "Dagens lunch · rätter"


class RivasMenyCategory(Category):
    class Meta:
        proxy = True
        verbose_name = "RIVAS MENY · kategori"
        verbose_name_plural = "RIVAS MENY · kategorier"


class RivasMenyProduct(Product):
    class Meta:
        proxy = True
        verbose_name = "RIVAS MENY · rätt"
        verbose_name_plural = "RIVAS MENY · rätter"


class TakeAwayCategory(Category):
    class Meta:
        proxy = True
        verbose_name = "TAKE AWAY · kategori"
        verbose_name_plural = "TAKE AWAY · kategorier"


class TakeAwayProduct(Product):
    class Meta:
        proxy = True
        verbose_name = "TAKE AWAY · rätt"
        verbose_name_plural = "TAKE AWAY · rätter"


class StoraSallskapsmenyCategory(Category):
    class Meta:
        proxy = True
        verbose_name = "STORA SÄLLSKAPSMENY · kategori"
        verbose_name_plural = "STORA SÄLLSKAPSMENY · kategorier"


class StoraSallskapsmenyProduct(Product):
    class Meta:
        proxy = True
        verbose_name = "STORA SÄLLSKAPSMENY · rätt"
        verbose_name_plural = "STORA SÄLLSKAPSMENY · rätter"


class SnacksDrinkarCategory(Category):
    class Meta:
        proxy = True
        verbose_name = "SNACKS & DRINKAR · kategori"
        verbose_name_plural = "SNACKS & DRINKAR · kategorier"


class SnacksDrinkarProduct(Product):
    class Meta:
        proxy = True
        verbose_name = "SNACKS & DRINKAR · rätt"
        verbose_name_plural = "SNACKS & DRINKAR · rätter"


class DryckCategory(Category):
    class Meta:
        proxy = True
        verbose_name = "DRYCK · kategori"
        verbose_name_plural = "DRYCK · kategorier"


class DryckProduct(Product):
    class Meta:
        proxy = True
        verbose_name = "DRYCK · rätt"
        verbose_name_plural = "DRYCK · rätter"


SECTION_ADMIN_MODELS: dict[str, dict[str, object]] = {
    "dagens-lunch": {
        "name": "Dagens lunch",
        "category_proxy": DagensLunchCategory,
        "product_proxy": DagensLunchProduct,
    },
    "rivas-meny": {
        "name": "RIVAS MENY",
        "category_proxy": RivasMenyCategory,
        "product_proxy": RivasMenyProduct,
    },
    "take-away": {
        "name": "TAKE AWAY",
        "category_proxy": TakeAwayCategory,
        "product_proxy": TakeAwayProduct,
    },
    "stora-sallskapsmeny": {
        "name": "STORA SÄLLSKAPSMENY",
        "category_proxy": StoraSallskapsmenyCategory,
        "product_proxy": StoraSallskapsmenyProduct,
    },
    "snacks-drinkar": {
        "name": "SNACKS & DRINKAR",
        "category_proxy": SnacksDrinkarCategory,
        "product_proxy": SnacksDrinkarProduct,
    },
    "dryck": {
        "name": "DRYCK",
        "category_proxy": DryckCategory,
        "product_proxy": DryckProduct,
    },
}
