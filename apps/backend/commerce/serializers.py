from decimal import Decimal

from rest_framework import serializers

from catalog.models import Category, ModifierOption, Product
from catalog.pricing import price_from_ex_vat, quantize
from commerce.models import Cart, CartLine, Customer, Order, OrderLine


class PricingSerializer(serializers.Serializer):
    price_ex_vat = serializers.CharField()
    vat_amount = serializers.CharField()
    price_inc_vat = serializers.CharField()
    vat_rate = serializers.CharField()


class CartLineSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_slug = serializers.CharField(source="product.slug", read_only=True)
    unit_pricing = serializers.SerializerMethodField()
    line_pricing = serializers.SerializerMethodField()

    class Meta:
        model = CartLine
        fields = [
            "id",
            "product",
            "product_name",
            "product_slug",
            "quantity",
            "selected_modifiers",
            "unit_pricing",
            "line_pricing",
        ]
        read_only_fields = ["id"]

    def _modifier_delta(self, line: CartLine) -> Decimal:
        total = Decimal("0")
        for mod in line.selected_modifiers or []:
            option_id = mod.get("option_id")
            if option_id:
                try:
                    option = ModifierOption.objects.get(pk=option_id, is_available=True)
                    total += Decimal(str(option.price_delta))
                except ModifierOption.DoesNotExist:
                    pass
        return total

    def get_unit_pricing(self, line: CartLine) -> dict:
        base = Decimal(str(line.product.base_price)) + self._modifier_delta(line)
        return price_from_ex_vat(base, Decimal(str(line.product.vat_rate)))

    def get_line_pricing(self, line: CartLine) -> dict:
        unit = Decimal(self.get_unit_pricing(line)["price_ex_vat"])
        total_ex = quantize(unit * line.quantity)
        return price_from_ex_vat(total_ex, Decimal(str(line.product.vat_rate)))


class CartSerializer(serializers.ModelSerializer):
    lines = CartLineSerializer(many=True, read_only=True)
    totals = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "lines", "totals"]

    def get_totals(self, cart: Cart) -> dict:
        subtotal_ex = Decimal("0")
        vat_total = Decimal("0")
        line_serializer = CartLineSerializer()
        for line in cart.lines.select_related("product").all():
            pricing = line_serializer.get_line_pricing(line)
            subtotal_ex += Decimal(pricing["price_ex_vat"])
            vat_total += Decimal(pricing["vat_amount"])
        total_inc = quantize(subtotal_ex + vat_total)
        return {
            "subtotal_ex_vat": str(quantize(subtotal_ex)),
            "vat_total": str(quantize(vat_total)),
            "total_inc_vat": str(total_inc),
        }


class CartLineCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    selected_modifiers = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list,
    )


class CheckoutSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=200)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)


class OrderLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderLine
        fields = [
            "product_name",
            "quantity",
            "unit_price_ex_vat",
            "vat_rate",
            "vat_amount",
            "line_total_inc_vat",
            "selected_modifiers",
        ]


class OrderSerializer(serializers.ModelSerializer):
    lines = OrderLineSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    customer_email = serializers.CharField(source="customer.email", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "ref",
            "status",
            "payment_status",
            "subtotal_ex_vat",
            "vat_total",
            "total_inc_vat",
            "notes",
            "customer_name",
            "customer_email",
            "lines",
            "created_at",
            "updated_at",
        ]


class CustomerSerializer(serializers.ModelSerializer):
    order_count = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = ["id", "email", "name", "phone", "order_count", "created_at"]

    def get_order_count(self, obj: Customer) -> int:
        return obj.orders.count()


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)


class ProductAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class CategoryAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"