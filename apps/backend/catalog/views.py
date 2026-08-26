from decimal import Decimal

from django.db.models import Count, Sum
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Category, Product
from catalog.serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)
from commerce.models import Customer, Order
from commerce.serializers import (
    CategoryAdminSerializer,
    CustomerSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
    ProductAdminSerializer,
)


class CategoryListView(APIView):
    def get(self, request: Request) -> Response:
        categories = Category.objects.filter(is_active=True)
        return Response(CategorySerializer(categories, many=True).data)


class ProductListView(APIView):
    def get(self, request: Request) -> Response:
        qs = Product.objects.filter(is_available=True).select_related("category")
        category_slug = request.query_params.get("category")
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        return Response(ProductListSerializer(qs, many=True).data)


class ProductDetailView(APIView):
    def get(self, request: Request, slug: str) -> Response:
        product = get_object_or_404(
            Product.objects.prefetch_related("modifier_groups__options"),
            slug=slug,
        )
        return Response(ProductDetailSerializer(product).data)


class AdminOverviewView(APIView):
    def get(self, request: Request) -> Response:
        today_orders = Order.objects.filter(status__in=["confirmed", "preparing", "ready"])
        revenue = Order.objects.filter(payment_status="paid").aggregate(
            total=Sum("total_inc_vat"),
        )["total"] or Decimal("0")
        low_stock = Product.objects.filter(inventory_count__lt=10, is_available=True).count()
        return Response(
            {
                "orders_today": today_orders.count(),
                "revenue_total": str(revenue),
                "avg_ticket": str(
                    revenue / max(Order.objects.filter(payment_status="paid").count(), 1)
                ),
                "low_stock_count": low_stock,
                "pending_orders": Order.objects.filter(status="pending").count(),
            }
        )


class AdminOrderListView(APIView):
    def get(self, request: Request) -> Response:
        qs = Order.objects.select_related("customer").all()
        status_filter = request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response(OrderSerializer(qs[:100], many=True).data)


class AdminOrderDetailView(APIView):
    def get(self, request: Request, order_id: int) -> Response:
        order = get_object_or_404(Order.objects.prefetch_related("lines"), pk=order_id)
        return Response(OrderSerializer(order).data)

    def patch(self, request: Request, order_id: int) -> Response:
        order = get_object_or_404(Order, pk=order_id)
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order.status = serializer.validated_data["status"]
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order).data)


class AdminProductListView(APIView):
    def get(self, request: Request) -> Response:
        products = Product.objects.select_related("category").all()
        return Response(ProductAdminSerializer(products, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = ProductAdminSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(ProductAdminSerializer(product).data, status=status.HTTP_201_CREATED)


class AdminProductDetailView(APIView):
    def patch(self, request: Request, product_id: int) -> Response:
        product = get_object_or_404(Product, pk=product_id)
        serializer = ProductAdminSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response(ProductAdminSerializer(product).data)


class AdminCategoryListView(APIView):
    def get(self, request: Request) -> Response:
        categories = Category.objects.annotate(pc=Count("products")).all()
        return Response(CategoryAdminSerializer(categories, many=True).data)


class AdminInventoryView(APIView):
    def get(self, request: Request) -> Response:
        products = Product.objects.all().values(
            "id", "name", "slug", "inventory_count", "is_available", "category__name"
        )
        return Response(list(products))


class AdminCustomerListView(APIView):
    def get(self, request: Request) -> Response:
        customers = Customer.objects.annotate(order_count=Count("orders")).all()
        return Response(CustomerSerializer(customers, many=True).data)


class AdminSalesView(APIView):
    def get(self, request: Request) -> Response:
        paid = Order.objects.filter(payment_status="paid")
        return Response(
            {
                "total_orders": paid.count(),
                "total_revenue": str(paid.aggregate(t=Sum("total_inc_vat"))["t"] or Decimal("0")),
                "total_vat": str(paid.aggregate(t=Sum("vat_total"))["t"] or Decimal("0")),
            }
        )
