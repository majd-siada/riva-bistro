from __future__ import annotations

from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.admin_serializers import AdminCategorySerializer, AdminProductSerializer
from catalog.models import Category, Product


class AdminCategoryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminCategorySerializer
    queryset = Category.objects.all()


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminCategorySerializer
    queryset = Category.objects.all()


class AdminProductListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminProductSerializer
    queryset = Product.objects.select_related("category").all()

    def get_serializer_context(self):
        return {"request": self.request}


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminProductSerializer
    queryset = Product.objects.select_related("category").all()

    def get_serializer_context(self):
        return {"request": self.request}


class AdminProductImageView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
    MAX_BYTES = 5 * 1024 * 1024

    def post(self, request: Request, pk: int) -> Response:
        product = Product.objects.filter(pk=pk).first()
        if not product:
            return Response(status=status.HTTP_404_NOT_FOUND)
        image = request.FILES.get("image")
        if not image:
            return Response(
                {"detail": "Ingen bild bifogades."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        name = (image.name or "").lower()
        if not any(name.endswith(ext) for ext in self.ALLOWED_EXTENSIONS) or (
            image.content_type and image.content_type not in self.ALLOWED_TYPES
        ):
            return Response(
                {"detail": "Bilden måste vara JPG, PNG eller WebP."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if image.size and image.size > self.MAX_BYTES:
            return Response(
                {"detail": "Bilden är för stor (max 5 MB)."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        product.image = image
        product.save(update_fields=["image", "updated_at"])
        serializer = AdminProductSerializer(product, context={"request": request})
        return Response(serializer.data)
