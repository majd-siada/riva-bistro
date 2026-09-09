from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiParameter, extend_schema
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
    @extend_schema(tags=["menu"], responses={200: CategorySerializer(many=True)})
    def get(self, request: Request) -> Response:
        categories = (
            Category.objects.filter(is_active=True)
            .select_related("parent")
            .order_by("sort_order", "id")
        )
        return Response(CategorySerializer(categories, many=True).data)


class CategoryDetailView(APIView):
    @extend_schema(tags=["menu"], responses={200: CategorySerializer})
    def get(self, request: Request, slug: str) -> Response:
        category = get_object_or_404(
            Category.objects.filter(is_active=True).select_related("parent"),
            slug=slug,
        )
        return Response(CategorySerializer(category).data)


class CategoryItemsView(APIView):
    """Available products belonging to this category only (no descendants)."""

    @extend_schema(tags=["menu"], responses={200: ProductListSerializer(many=True)})
    def get(self, request: Request, slug: str) -> Response:
        category = get_object_or_404(Category.objects.filter(is_active=True), slug=slug)
        qs = (
            Product.objects.filter(is_available=True, category=category)
            .select_related("category")
            .order_by("sort_order", "id")
        )
        serializer = ProductListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)


class ProductListView(APIView):
    @extend_schema(
        tags=["menu"],
        parameters=[
            OpenApiParameter(name="category", type=str, location=OpenApiParameter.QUERY),
            OpenApiParameter(name="featured", type=str, location=OpenApiParameter.QUERY),
        ],
        responses={200: ProductListSerializer(many=True)},
    )
    def get(self, request: Request) -> Response:
        qs = (
            Product.objects.filter(is_available=True, category__is_active=True)
            .select_related("category")
            .order_by("sort_order", "id")
        )
        category_slug = request.query_params.get("category")
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        if request.query_params.get("featured") in {"1", "true", "yes"}:
            qs = qs.filter(is_featured=True).order_by("featured_order", "name")
        serializer = ProductListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)


class FeaturedProductListView(APIView):
    """Featured dishes for the homepage (admin-managed)."""

    @extend_schema(tags=["menu"], responses={200: ProductListSerializer(many=True)})
    def get(self, request: Request) -> Response:
        qs = (
            Product.objects.filter(
                is_available=True, is_featured=True, category__is_active=True
            )
            .select_related("category")
            .order_by("featured_order", "name")[:8]
        )
        serializer = ProductListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)


class ProductDetailView(APIView):
    @extend_schema(tags=["menu"], responses={200: ProductDetailSerializer})
    def get(self, request: Request, slug: str) -> Response:
        product = get_object_or_404(
            Product.objects.filter(
                is_available=True, category__is_active=True
            ).prefetch_related("modifier_groups__options"),
            slug=slug,
        )
        serializer = ProductDetailSerializer(product, context={"request": request})
        return Response(serializer.data)
