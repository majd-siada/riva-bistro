from django.shortcuts import get_object_or_404
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Category, Product
from catalog.serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
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
        if request.query_params.get("featured") in {"1", "true", "yes"}:
            qs = qs.filter(is_featured=True).order_by("featured_order", "name")
        serializer = ProductListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)


class FeaturedProductListView(APIView):
    """Featured dishes for the homepage (admin-managed)."""

    def get(self, request: Request) -> Response:
        qs = (
            Product.objects.filter(is_available=True, is_featured=True)
            .select_related("category")
            .order_by("featured_order", "name")[:8]
        )
        serializer = ProductListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)


class ProductDetailView(APIView):
    def get(self, request: Request, slug: str) -> Response:
        product = get_object_or_404(
            Product.objects.prefetch_related("modifier_groups__options"),
            slug=slug,
        )
        serializer = ProductDetailSerializer(product, context={"request": request})
        return Response(serializer.data)
