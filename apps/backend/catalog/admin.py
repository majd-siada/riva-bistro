from __future__ import annotations

from decimal import Decimal

from django.contrib import admin
from django.http import HttpRequest
from django.utils.html import format_html

from catalog.models import Category, Product
from catalog.pricing import price_from_ex_vat
from catalog.section_proxies import (
    SECTION_ADMIN_MODELS,
    section_category_q,
    section_product_q,
)

# ---------------------------------------------------------------------------
# Shared section helpers
# ---------------------------------------------------------------------------


class ProductInline(admin.TabularInline):
    model = Product
    extra = 0
    fields = (
        "name",
        "base_price",
        "vat_rate",
        "sort_order",
        "is_available",
        "is_featured",
        "featured_order",
    )
    ordering = ("sort_order", "name")
    show_change_link = True


class SectionCategoryAdmin(admin.ModelAdmin):
    """Category admin scoped to one public menu section."""

    section_slug: str = ""
    list_display = (
        "name",
        "slug",
        "parent",
        "sort_order",
        "is_active",
        "product_count",
    )
    list_editable = ("sort_order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order", "name")
    inlines = [ProductInline]
    fields = (
        "name",
        "slug",
        "parent",
        "description",
        "sort_order",
        "is_active",
    )

    def get_queryset(self, request: HttpRequest):
        return (
            super()
            .get_queryset(request)
            .filter(section_category_q(self.section_slug))
            .select_related("parent")
        )

    @admin.display(description="Rätter")
    def product_count(self, obj: Category) -> int:
        return obj.products.count()

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "parent":
            kwargs["queryset"] = Category.objects.filter(
                slug=self.section_slug,
                parent__isnull=True,
            )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def get_changeform_initial_data(self, request: HttpRequest):
        data = super().get_changeform_initial_data(request)
        shell = Category.objects.filter(
            slug=self.section_slug,
            parent__isnull=True,
        ).first()
        if shell is not None:
            data.setdefault("parent", shell.pk)
        return data

    def save_model(self, request, obj, form, change):
        if obj.parent_id is None and obj.slug != self.section_slug:
            shell = Category.objects.filter(
                slug=self.section_slug,
                parent__isnull=True,
            ).first()
            if shell is not None:
                obj.parent = shell
        super().save_model(request, obj, form, change)


class SectionProductAdmin(admin.ModelAdmin):
    """Product admin scoped to one public menu section."""

    section_slug: str = ""
    list_display = (
        "name",
        "category",
        "price_display",
        "base_price",
        "sort_order",
        "is_available",
        "is_featured",
        "featured_order",
    )
    list_editable = (
        "sort_order",
        "is_available",
        "is_featured",
        "featured_order",
    )
    search_fields = ("name", "slug", "description", "category__name")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("category__sort_order", "sort_order", "name")
    fields = (
        "category",
        "name",
        "slug",
        "description",
        "base_price",
        "vat_rate",
        "image",
        "image_url",
        "sort_order",
        "is_available",
        "is_featured",
        "featured_order",
        "inventory_count",
    )

    def get_queryset(self, request: HttpRequest):
        return (
            super()
            .get_queryset(request)
            .filter(section_product_q(self.section_slug))
            .select_related("category", "category__parent")
        )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "category":
            kwargs["queryset"] = Category.objects.filter(
                section_category_q(self.section_slug)
            ).order_by("sort_order", "name")
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def get_changeform_initial_data(self, request: HttpRequest):
        data = super().get_changeform_initial_data(request)
        shell = Category.objects.filter(
            slug=self.section_slug,
            parent__isnull=True,
        ).first()
        if shell is not None:
            data.setdefault("category", shell.pk)
            # Food default VAT matches seed_menu / public meny.
            data.setdefault("vat_rate", Decimal("0.12"))
        return data

    @admin.display(description="Pris (inkl. moms)", ordering="base_price")
    def price_display(self, obj: Product) -> str:
        pricing = price_from_ex_vat(obj.base_price, Decimal(str(obj.vat_rate)))
        return f"{pricing['price_inc_vat']} kr"

    def get_list_filter(self, request: HttpRequest):
        section_slug = self.section_slug

        class SectionCategoryFilter(admin.SimpleListFilter):
            title = "kategori"
            parameter_name = "category"

            def lookups(self, request, model_admin):
                qs = Category.objects.filter(
                    section_category_q(section_slug)
                ).order_by("sort_order", "name")
                return [(str(c.pk), c.name) for c in qs]

            def queryset(self, request, queryset):
                value = self.value()
                if value:
                    return queryset.filter(category_id=value)
                return queryset

        return (
            "is_available",
            "is_featured",
            SectionCategoryFilter,
        )


def _register_section_admins() -> None:
    for slug, meta in SECTION_ADMIN_MODELS.items():
        cat_proxy = meta["category_proxy"]
        prod_proxy = meta["product_proxy"]
        section_name = meta["name"]

        cat_admin = type(
            f"{cat_proxy.__name__}Admin",
            (SectionCategoryAdmin,),
            {
                "section_slug": slug,
                "__module__": __name__,
            },
        )
        prod_admin = type(
            f"{prod_proxy.__name__}Admin",
            (SectionProductAdmin,),
            {
                "section_slug": slug,
                "__module__": __name__,
            },
        )

        if not admin.site.is_registered(cat_proxy):
            admin.site.register(cat_proxy, cat_admin)
        if not admin.site.is_registered(prod_proxy):
            admin.site.register(prod_proxy, prod_admin)

        cat_proxy._meta.verbose_name = f"{section_name} — kategori"
        cat_proxy._meta.verbose_name_plural = f"{section_name} — kategorier"
        prod_proxy._meta.verbose_name = f"{section_name} — rätt"
        prod_proxy._meta.verbose_name_plural = f"{section_name} — rätter"


_register_section_admins()


# ---------------------------------------------------------------------------
# Global catalog (power-user / full tree)
# ---------------------------------------------------------------------------


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Full category tree. Prefer the per-section admins for day-to-day edits."""

    list_display = ("name", "slug", "parent", "sort_order", "is_active")
    list_editable = ("sort_order", "is_active")
    list_filter = ("is_active", "parent")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order", "name")
    autocomplete_fields = ("parent",)
    list_select_related = ("parent",)
    inlines = [ProductInline]
    fields = ("name", "slug", "description", "parent", "sort_order", "is_active")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "price_display",
        "base_price",
        "sort_order",
        "is_available",
        "is_featured",
        "featured_order",
        "image_preview",
    )
    list_editable = ("sort_order", "is_available", "is_featured", "featured_order")
    list_filter = ("is_available", "is_featured", "category")
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("category__sort_order", "sort_order", "name")
    autocomplete_fields = ("category",)
    fields = (
        "category",
        "name",
        "slug",
        "description",
        "base_price",
        "vat_rate",
        "image",
        "image_url",
        "sort_order",
        "is_available",
        "is_featured",
        "featured_order",
        "inventory_count",
    )

    @admin.display(description="Pris (inkl. moms)", ordering="base_price")
    def price_display(self, obj: Product) -> str:
        pricing = price_from_ex_vat(obj.base_price, Decimal(str(obj.vat_rate)))
        return f"{pricing['price_inc_vat']} kr"

    @admin.display(description="Bild")
    def image_preview(self, obj: Product) -> str:
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height:40px;border-radius:4px;" />',
                obj.image.url,
            )
        return "—"


