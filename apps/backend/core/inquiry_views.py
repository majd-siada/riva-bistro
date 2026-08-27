from __future__ import annotations

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.email import send_contact_message, send_event_inquiry
from core.serializers import ContactSerializer, EventInquirySerializer

FAIL_MESSAGE = "Något gick fel. Försök igen eller kontakta oss direkt."


class ContactView(APIView):
    """Public contact form → emails the restaurant notification inbox."""

    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request: Request) -> Response:
        serializer = ContactSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sent = send_contact_message(**serializer.validated_data)
        if not sent:
            return Response(
                {"detail": FAIL_MESSAGE}, status=status.HTTP_502_BAD_GATEWAY
            )
        return Response({"status": "sent"}, status=status.HTTP_200_OK)


class EventInquiryView(APIView):
    """Public private-events inquiry → emails the restaurant notification inbox."""

    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request: Request) -> Response:
        serializer = EventInquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sent = send_event_inquiry(**serializer.validated_data)
        if not sent:
            return Response(
                {"detail": FAIL_MESSAGE}, status=status.HTTP_502_BAD_GATEWAY
            )
        return Response({"status": "sent"}, status=status.HTTP_200_OK)
