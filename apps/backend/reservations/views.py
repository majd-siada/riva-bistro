from __future__ import annotations

from datetime import date as date_cls

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.email import send_reservation_confirmation
from reservations.availability import compute_availability
from reservations.booking import BookingError, create_reservation
from reservations.models import OpeningHours
from reservations.serializers import (
    OpeningHoursSerializer,
    ReservationCreateSerializer,
    ReservationSerializer,
)


class HoursView(APIView):
    """Public opening hours for footer / booking display."""

    def get(self, request: Request) -> Response:
        hours = OpeningHours.objects.all()
        return Response(OpeningHoursSerializer(hours, many=True).data)


class AvailabilityView(APIView):
    """Public availability for a given date: open slots with remaining capacity."""

    def get(self, request: Request) -> Response:
        raw = request.query_params.get("date")
        if not raw:
            return Response(
                {"detail": "Ange ett datum."}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            target = date_cls.fromisoformat(raw)
        except ValueError:
            return Response(
                {"detail": "Ogiltigt datum."}, status=status.HTTP_400_BAD_REQUEST
            )
        return Response(compute_availability(target))


class ReservationCreateView(APIView):
    """Create a real, confirmed reservation (backend-enforced availability).

    Public endpoint: no session auth (and therefore no CSRF), so it works for
    anonymous guests even if a Django session happens to be authenticated.
    """

    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request: Request) -> Response:
        serializer = ReservationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            reservation = create_reservation(**data)
        except BookingError as exc:
            return Response(
                {"detail": exc.message, "code": exc.code},
                status=exc.http_status,
            )

        # Confirmation email is best-effort: the booking is already confirmed in
        # the database, so a mail failure must not turn a real success into an
        # error. We record whether it actually went out.
        email_sent = send_reservation_confirmation(reservation)
        if email_sent and not reservation.confirmation_email_sent:
            reservation.confirmation_email_sent = True
            reservation.save(update_fields=["confirmation_email_sent"])

        body = ReservationSerializer(reservation).data
        body["email_sent"] = email_sent
        return Response(body, status=status.HTTP_201_CREATED)
