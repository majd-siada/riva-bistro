from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Product
from catalog.pricing import quantize
from commerce.models import Cart, CartLine, Customer, Order, OrderLine, Payment
from commerce.serializers import (
    CartLineCreateSerializer,
    CartLineSerializer,
    CartSerializer,
    CheckoutSerializer,
    OrderSerializer,
)

CART_SESSION_KEY = "riva_cart_id"


def get_or_create_cart(request: Request) -> Cart:
    cart_id = request.session.get(CART_SESSION_KEY)
    cart = None
    if cart_id:
        cart = Cart.objects.filter(pk=cart_id).first()
    if cart is None:
        cart = Cart.objects.create(session_key=request.session.session_key or "")
        request.session[CART_SESSION_KEY] = cart.pk
        request.session.modified = True
    return cart


class CartView(APIView):
    def get(self, request: Request) -> Response:
        cart = get_or_create_cart(request)
        return Response(CartSerializer(cart).data)


class CartLineCreateView(APIView):
    def post(self, request: Request) -> Response:
        serializer = CartLineCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        product = get_object_or_404(Product, pk=data["product_id"], is_available=True)
        cart = get_or_create_cart(request)

        line = CartLine.objects.create(
            cart=cart,
            product=product,
            quantity=data["quantity"],
            selected_modifiers=data.get("selected_modifiers", []),
        )
        return Response(CartLineSerializer(line).data, status=status.HTTP_201_CREATED)


class CartLineDetailView(APIView):
    def patch(self, request: Request, line_id: int) -> Response:
        cart = get_or_create_cart(request)
        line = get_object_or_404(CartLine, pk=line_id, cart=cart)
        quantity = request.data.get("quantity")
        if quantity is not None:
            line.quantity = max(1, int(quantity))
        if "selected_modifiers" in request.data:
            line.selected_modifiers = request.data["selected_modifiers"]
        line.save()
        return Response(CartLineSerializer(line).data)

    def delete(self, request: Request, line_id: int) -> Response:
        cart = get_or_create_cart(request)
        line = get_object_or_404(CartLine, pk=line_id, cart=cart)
        line.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CheckoutView(APIView):
    @transaction.atomic
    def post(self, request: Request) -> Response:
        checkout = CheckoutSerializer(data=request.data)
        checkout.is_valid(raise_exception=True)
        data = checkout.validated_data
        cart = get_or_create_cart(request)

        if not cart.lines.exists():
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        customer, _ = Customer.objects.get_or_create(
            email=data["email"],
            defaults={"name": data["name"], "phone": data.get("phone", "")},
        )
        if customer.name != data["name"]:
            customer.name = data["name"]
            customer.phone = data.get("phone", customer.phone)
            customer.save()

        line_serializer = CartLineSerializer()
        subtotal_ex = Decimal("0")
        vat_total = Decimal("0")
        order_lines_data = []

        for line in cart.lines.select_related("product").all():
            pricing = line_serializer.get_line_pricing(line)
            subtotal_ex += Decimal(pricing["price_ex_vat"])
            vat_total += Decimal(pricing["vat_amount"])
            unit_ex = Decimal(line_serializer.get_unit_pricing(line)["price_ex_vat"])
            order_lines_data.append(
                {
                    "product_name": line.product.name,
                    "quantity": line.quantity,
                    "unit_price_ex_vat": unit_ex,
                    "vat_rate": line.product.vat_rate,
                    "vat_amount": Decimal(pricing["vat_amount"]),
                    "line_total_inc_vat": Decimal(pricing["price_inc_vat"]),
                    "selected_modifiers": line.selected_modifiers,
                }
            )

        order = Order.objects.create(
            customer=customer,
            status=Order.Status.CONFIRMED,
            payment_status=Order.PaymentStatus.PAID,
            subtotal_ex_vat=quantize(subtotal_ex),
            vat_total=quantize(vat_total),
            total_inc_vat=quantize(subtotal_ex + vat_total),
            notes=data.get("notes", ""),
        )

        for line_data in order_lines_data:
            OrderLine.objects.create(order=order, **line_data)

        Payment.objects.create(
            order=order,
            provider="stub",
            status=Payment.Status.COMPLETED,
            external_id=f"stub_{order.ref}",
        )

        cart.lines.all().delete()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    def get(self, request: Request, ref: str) -> Response:
        order = get_object_or_404(Order, ref=ref)
        return Response(OrderSerializer(order).data)


class OrderStatusView(APIView):
    def get(self, request: Request, ref: str) -> Response:
        order = get_object_or_404(Order, ref=ref)
        return Response(
            {
                "ref": order.ref,
                "status": order.status,
                "payment_status": order.payment_status,
            }
        )


class AccountOrdersView(APIView):
    def get(self, request: Request) -> Response:
        email = request.query_params.get("email")
        if not email:
            return Response(
                {"detail": "email query param required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        customer = Customer.objects.filter(email=email).first()
        if not customer:
            return Response([])
        orders = customer.orders.all()
        return Response(OrderSerializer(orders, many=True).data)


class AccountOrderDetailView(APIView):
    def get(self, request: Request, order_id: int) -> Response:
        email = request.query_params.get("email")
        order = get_object_or_404(Order, pk=order_id)
        if email and order.customer.email != email:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data)
