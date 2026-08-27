from decimal import Decimal

from rest_framework import serializers

from catalog.models import Category, ModifierGroup, ModifierOption, Product
from catalog.pricing import price_from_ex_vat


class ModifierOptionSerializer(serializers.ModelSerializer):
    pricing = serializers.SerializerMethodField()

    class Meta:
        model = ModifierOption
        fields = ["id", "name", "price_delta", "is_available", "pricing"]

    def get_pricing(self, obj: ModifierOption) -> dict:
        return price_from_ex_vat(Decimal(str(obj.price_delta)))


class ModifierGroupSerializer(serializers.ModelSerializer):
    options = ModifierOptionSerializer(many=True, read_only=True)

    class Meta:
        model = ModifierGroup
        fields = [
            "id",
            "name",
            "min_selections",
            "max_selections",
            "required",
            "options",
        ]


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    pricing = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "image_url",
            "is_available",
            "is_featured",
            "category_name",
            "category_slug",
            "pricing",
        ]

    def get_pricing(self, obj: Product) -> dict:
        return price_from_ex_vat(Decimal(str(obj.base_price)), Decimal(str(obj.vat_rate)))

    def get_image_url(self, obj: Product) -> str:
        """Prefer an uploaded image (absolute URL) over an external URL."""
        if obj.image:
            request = self.context.get("request")
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return obj.image_url or ""


class ProductDetailSerializer(ProductListSerializer):
    modifier_groups = ModifierGroupSerializer(many=True, read_only=True)

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ["modifier_groups", "inventory_count"]


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "product_count"]

    def get_product_count(self, obj: Category) -> int:
        return obj.products.filter(is_available=True).count()
