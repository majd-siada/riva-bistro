from django.contrib import admin

from catalog.models import Category, ModifierGroup, ModifierOption, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "sort_order", "is_active"]
    prepopulated_fields = {"slug": ("name",)}


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
