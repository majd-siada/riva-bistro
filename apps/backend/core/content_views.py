from __future__ import annotations

from django.db.models import Q
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import (
    ContactMessage,
    EventInquiry,
    GalleryItem,
    NewsItem,
    Offer,
    RestaurantProfile,
    SiteContent,
)
from core.revalidate import trigger_frontend_revalidation
from core.serializers import (
    AdminContactMessageSerializer,
    AdminEventInquirySerializer,
    AdminGalleryItemSerializer,
    AdminNewsItemSerializer,
    GalleryItemSerializer,
    NewsItemSerializer,
    OfferSerializer,
    PublicOfferSerializer,
    RestaurantProfileSerializer,
    SiteContentSerializer,
)


def _revalidate(*paths: str) -> None:
    trigger_frontend_revalidation(list(paths) if paths else None)


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


class RestaurantProfileView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    @extend_schema(tags=["content"], responses={200: RestaurantProfileSerializer})
    def get(self, request: Request) -> Response:
        return Response(RestaurantProfileSerializer(RestaurantProfile.load()).data)


class SiteContentView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    @extend_schema(tags=["content"], responses={200: SiteContentSerializer})
    def get(self, request: Request) -> Response:
        return Response(SiteContentSerializer(SiteContent.load()).data)


class OfferListView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    @extend_schema(tags=["content"], responses={200: PublicOfferSerializer(many=True)})
    def get(self, request: Request) -> Response:
        now = timezone.now()
        qs = (
            Offer.objects.filter(is_active=True)
            .filter(Q(starts_at__isnull=True) | Q(starts_at__lte=now))
            .filter(Q(ends_at__isnull=True) | Q(ends_at__gte=now))
        )
        return Response(PublicOfferSerializer(qs, many=True).data)


class AdminContactMessageListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminContactMessageSerializer

    def get_queryset(self):
        return ContactMessage.objects.all()[:200]


class AdminContactMessageDetailView(generics.DestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = ContactMessage.objects.all()


class AdminEventInquiryListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminEventInquirySerializer

    def get_queryset(self):
        return EventInquiry.objects.all()[:200]


class AdminEventInquiryDetailView(generics.DestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = EventInquiry.objects.all()


class AdminInquiryBulkDeleteView(APIView):
    """Delete many contact messages or event inquiries in one request."""

    permission_classes = [IsAdminUser]

    @extend_schema(tags=["admin-content"], request=dict, responses={200: dict})
    def post(self, request: Request) -> Response:
        kind = request.data.get("kind")
        ids = request.data.get("ids")
        if kind not in {"contact", "event"}:
            return Response(
                {"detail": "kind måste vara contact eller event."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not isinstance(ids, list) or not ids:
            return Response(
                {"detail": "ids måste vara en icke-tom lista."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        clean_ids: list[int] = []
        for value in ids:
            try:
                clean_ids.append(int(value))
            except (TypeError, ValueError):
                return Response(
                    {"detail": "ids måste vara heltal."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        model = ContactMessage if kind == "contact" else EventInquiry
        deleted, _ = model.objects.filter(pk__in=clean_ids).delete()
        return Response({"deleted": deleted})


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
        _revalidate("/")


class AdminNewsDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminNewsItemSerializer
    queryset = NewsItem.objects.all()

    def perform_update(self, serializer):
        serializer.save()
        _revalidate("/")

    def perform_destroy(self, instance):
        instance.delete()
        _revalidate("/")


class AdminGalleryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    serializer_class = AdminGalleryItemSerializer
    queryset = GalleryItem.objects.all()

    def perform_create(self, serializer):
        serializer.save()
        _revalidate("/", "/galleri")


class AdminGalleryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    serializer_class = AdminGalleryItemSerializer
    queryset = GalleryItem.objects.all()

    def perform_update(self, serializer):
        serializer.save()
        _revalidate("/", "/galleri")

    def perform_destroy(self, instance):
        instance.delete()
        _revalidate("/", "/galleri")


class AdminRestaurantProfileView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(tags=["admin-content"], responses={200: RestaurantProfileSerializer})
    def get(self, request: Request) -> Response:
        return Response(RestaurantProfileSerializer(RestaurantProfile.load()).data)

    @extend_schema(
        tags=["admin-content"],
        request=RestaurantProfileSerializer,
        responses={200: RestaurantProfileSerializer},
    )
    def patch(self, request: Request) -> Response:
        profile = RestaurantProfile.load()
        serializer = RestaurantProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        _revalidate("/", "/kontakt", "/om-oss", "/boka")
        return Response(serializer.data)


class AdminSiteContentView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @extend_schema(tags=["admin-content"], responses={200: SiteContentSerializer})
    def get(self, request: Request) -> Response:
        return Response(SiteContentSerializer(SiteContent.load()).data)

    @extend_schema(
        tags=["admin-content"],
        request=SiteContentSerializer,
        responses={200: SiteContentSerializer},
    )
    def patch(self, request: Request) -> Response:
        content = SiteContent.load()
        serializer = SiteContentSerializer(content, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        _revalidate("/")
        return Response(serializer.data)


class AdminOfferListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    serializer_class = OfferSerializer
    queryset = Offer.objects.all()

    def perform_create(self, serializer):
        serializer.save()
        _revalidate("/")


class AdminOfferDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    serializer_class = OfferSerializer
    queryset = Offer.objects.all()

    def perform_update(self, serializer):
        serializer.save()
        _revalidate("/")

    def perform_destroy(self, instance):
        instance.delete()
        _revalidate("/")
