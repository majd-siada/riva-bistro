from rest_framework import serializers

from catalog.models import Category, ModifierGroup, ModifierOption, Product


def _category_is_descendant(ancestor: Category, candidate: Category) -> bool:
    """Return True if candidate is ancestor or appears in ancestor's ancestor chain.

    Used to reject parent cycles (setting parent to self or a descendant).
    """
    seen: set[int] = set()
    current: Category | None = candidate
    while current is not None:
        if current.pk == ancestor.pk:
            return True
        if current.pk in seen:
            break
        seen.add(current.pk)
        current = current.parent
    return False


class AdminCategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    parent_slug = serializers.CharField(
        source="parent.slug", read_only=True, allow_null=True, default=None
    )

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "sort_order",
            "is_active",
            "parent",
            "parent_slug",
            "product_count",
        ]
        read_only_fields = ["slug", "product_count", "parent_slug"]

    def get_product_count(self, obj: Category) -> int:
        return obj.products.count()

    def validate_parent(self, parent: Category | None) -> Category | None:
        if parent is None:
            return None
        instance = getattr(self, "instance", None)
        if instance is not None:
            if parent.pk == instance.pk:
                raise serializers.ValidationError("A category cannot be its own parent.")
            if _category_is_descendant(instance, parent):
                raise serializers.ValidationError(
                    "Cannot set parent to a descendant of this category."
                )
        return parent

    def to_representation(self, instance: Category) -> dict:
        data = super().to_representation(instance)
        if instance.parent_id is None:
            data["parent"] = None
            data["parent_slug"] = None
        return data


class AdminModifierOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModifierOption
        fields = ["id", "name", "price_delta", "is_available", "sort_order"]


class AdminModifierGroupSerializer(serializers.ModelSerializer):
    options = AdminModifierOptionSerializer(many=True, read_only=True)

    class Meta:
        model = ModifierGroup
        fields = [
            "id",
            "name",
            "min_selections",
            "max_selections",
            "required",
            "sort_order",
            "options",
        ]


class AdminProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    image_upload_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "category",
            "category_name",
            "name",
            "slug",
            "description",
            "base_price",
            "vat_rate",
            "image_url",
            "image_upload_url",
            "is_available",
            "is_featured",
            "featured_order",
            "sort_order",
        ]
        read_only_fields = ["slug", "category_name", "image_upload_url"]

    def get_image_upload_url(self, obj: Product) -> str:
        if obj.image:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return ""
