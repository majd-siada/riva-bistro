from __future__ import annotations

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from core.email import send_contact_message, send_event_inquiry
from core.models import ContactMessage, EventInquiry
from core.serializers import (
    ContactSerializer,
    EventInquirySerializer,
    StatusResponseSerializer,
)


class ContactView(APIView):
    """Public contact form — persisted, then emailed to the restaurant inbox."""

    authentication_classes: list = []
    permission_classes: list = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "inquiries"

    @extend_schema(
        tags=["inquiries"],
        request=ContactSerializer,
        responses={200: StatusResponseSerializer},
    )
    def post(self, request: Request) -> Response:
        serializer = ContactSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        row = ContactMessage.objects.create(**data)
        sent = send_contact_message(**data)
        if sent and not row.email_sent:
            row.email_sent = True
            row.save(update_fields=["email_sent"])
        return Response({"status": "received", "email_sent": sent}, status=status.HTTP_200_OK)


class EventInquiryView(APIView):
    """Public private-events inquiry — persisted, then emailed."""

    authentication_classes: list = []
    permission_classes: list = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "inquiries"

    @extend_schema(
        tags=["inquiries"],
        request=EventInquirySerializer,
        responses={200: StatusResponseSerializer},
    )
    def post(self, request: Request) -> Response:
        serializer = EventInquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        row = EventInquiry.objects.create(**data)
        sent = send_event_inquiry(**data)
        if sent and not row.email_sent:
            row.email_sent = True
            row.save(update_fields=["email_sent"])
        return Response({"status": "received", "email_sent": sent}, status=status.HTTP_200_OK)
