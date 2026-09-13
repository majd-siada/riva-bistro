from __future__ import annotations

from decimal import Decimal

from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="children",
    )
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "id"]
        verbose_name_plural = "categories"
        indexes = [
            models.Index(fields=["parent", "sort_order"], name="catalog_cat_parent_sort_idx"),
        ]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    vat_rate = models.DecimalField(max_digits=5, decimal_places=4, default=Decimal("0.25"))
    image_url = models.URLField(max_length=500, blank=True)
    # FileField (not ImageField) to avoid a hard Pillow dependency; uploads are
    # validated (type/size) in the admin image endpoint.
    image = models.FileField(upload_to="menu/", null=True, blank=True)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    featured_order = models.PositiveIntegerField(default=0)
    inventory_count = models.PositiveIntegerField(default=999)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "id"]
        indexes = [
            models.Index(
                fields=["category", "sort_order"],
                name="catalog_prod_cat_sort_idx",
            ),
        ]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            # Slug is unique globally and read-only in admin; colliding names
            # (e.g. a second "Torskfilé") must not raise IntegrityError → 500.
            self.slug = _unique_slug(
                Product,
                self.name,
                exclude_pk=self.pk,
                max_length=self._meta.get_field("slug").max_length,
            )
        super().save(*args, **kwargs)


def _unique_slug(
    model_cls: type[models.Model],
    source: str,
    *,
    exclude_pk: int | None = None,
    max_length: int = 220,
) -> str:
    """Return slugify(source), appending -2, -3, … until unused."""
    base = (slugify(source) or "item")[:max_length]
    candidate = base
    n = 2
    while True:
        qs = model_cls.objects.filter(slug=candidate)
        if exclude_pk is not None:
            qs = qs.exclude(pk=exclude_pk)
        if not qs.exists():
            return candidate
        suffix = f"-{n}"
        candidate = f"{base[: max_length - len(suffix)]}{suffix}"
        n += 1


class ModifierGroup(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="modifier_groups",
    )
    name = models.CharField(max_length=120)
    min_selections = models.PositiveIntegerField(default=0)
    max_selections = models.PositiveIntegerField(default=1)
    required = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self) -> str:
        return f"{self.product.name} — {self.name}"


class ModifierOption(models.Model):
    group = models.ForeignKey(
        ModifierGroup,
        on_delete=models.CASCADE,
        related_name="options",
    )
    name = models.CharField(max_length=120)
    price_delta = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0"))
    is_available = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self) -> str:
        return self.name
