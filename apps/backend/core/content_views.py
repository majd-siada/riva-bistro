from __future__ import annotations

from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import ContactMessage, EventInquiry, GalleryItem, NewsItem
from core.serializers import (
    AdminContactMessageSerializer,
    AdminEventInquirySerializer,
    AdminGalleryItemSerializer,
    AdminNewsItemSerializer,
    GalleryItemSerializer,
    NewsItemSerializer,
)


class NewsListView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    @extend_schema(tags=["content"], responses={200: NewsItemSerializer(many=True)})
    def get(self, request: Request) -> Response:
        qs = NewsItem.objects.filter(is_published=True).exclude(published_at=None)
        return Response(NewsItemSerializer(qs[:20], many=True).data)


class GalleryListView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    @extend_schema(tags=["content"], responses={200: GalleryItemSerializer(many=True)})
    def get(self, request: Request) -> Response:
        qs = GalleryItem.objects.filter(is_published=True)
        return Response(GalleryItemSerializer(qs, many=True).data)


class AdminContactMessageListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminContactMessageSerializer

    def get_queryset(self):
        return ContactMessage.objects.all()[:200]


class AdminEventInquiryListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminEventInquirySerializer

    def get_queryset(self):
        return EventInquiry.objects.all()[:200]


class AdminNewsListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminNewsItemSerializer
    queryset = NewsItem.objects.all()

    def perform_create(self, serializer):
        if serializer.validated_data.get("is_published") and not serializer.validated_data.get(
            "published_at"
        ):
            serializer.save(published_at=timezone.now())
        else:
            serializer.save()


class AdminNewsDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminNewsItemSerializer
    queryset = NewsItem.objects.all()


class AdminGalleryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminGalleryItemSerializer
    queryset = GalleryItem.objects.all()


class AdminGalleryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminGalleryItemSerializer
    queryset = GalleryItem.objects.all()
