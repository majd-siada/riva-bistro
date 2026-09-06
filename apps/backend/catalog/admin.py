from django.contrib import admin

from catalog.models import Category, ModifierGroup, ModifierOption, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "parent", "sort_order", "is_active"]
    list_filter = ["is_active", "parent"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name", "slug"]
    ordering = ["sort_order", "id"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "base_price", "is_available", "inventory_count"]
    list_filter = ["category", "is_available"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(ModifierGroup)
class ModifierGroupAdmin(admin.ModelAdmin):
    list_display = ["name", "product", "required", "min_selections", "max_selections"]


@admin.register(ModifierOption)
class ModifierOptionAdmin(admin.ModelAdmin):
    list_display = ["name", "group", "price_delta", "is_available"]
