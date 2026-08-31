from decimal import Decimal

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from catalog.models import Category, ModifierGroup, ModifierOption, Product
from catalog.pricing import price_from_ex_vat


class PricingSerializer(serializers.Serializer):
    price_ex_vat = serializers.CharField()
    vat_amount = serializers.CharField()
    price_inc_vat = serializers.CharField()
    vat_rate = serializers.CharField()


class ModifierOptionSerializer(serializers.ModelSerializer):
    pricing = serializers.SerializerMethodField()

    class Meta:
        model = ModifierOption
        fields = ["id", "name", "price_delta", "is_available", "pricing"]

    @extend_schema_field(PricingSerializer)
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

    @extend_schema_field(PricingSerializer)
    def get_pricing(self, obj: Product) -> dict:
        return price_from_ex_vat(Decimal(str(obj.base_price)), Decimal(str(obj.vat_rate)))

    def get_image_url(self, obj: Product) -> str:
        """Prefer an uploaded image over an external URL.

        Uploaded images are returned as a root-relative media path (e.g.
        /media/menu/x.webp). The frontend resolves it against the public API
        origin, which works for both SSR and browser (unlike an absolute URL
        built from the internal container host)."""
        if obj.image:
            return obj.image.url
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
