from __future__ import annotations

from datetime import date as date_cls

from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from core.email import send_reservation_confirmation
from core.notifications import schedule_reservation_notifications
from reservations.availability import compute_availability
from reservations.booking import BookingError, create_reservation
from reservations.models import OpeningHours
from reservations.serializers import (
    AvailabilitySerializer,
    OpeningHoursSerializer,
    ReservationCreateResponseSerializer,
    ReservationCreateSerializer,
    ReservationSerializer,
)


class HoursView(APIView):
    """Public opening hours for footer / booking display."""

    @extend_schema(tags=["hours"], responses={200: OpeningHoursSerializer(many=True)})
    def get(self, request: Request) -> Response:
        WEEKDAY_LABELS = {
            0: "Måndag",
            1: "Tisdag",
            2: "Onsdag",
            3: "Torsdag",
            4: "Fredag",
            5: "Lördag",
            6: "Söndag",
        }
        existing = {row.weekday: row for row in OpeningHours.objects.all()}
        payload = []
        for weekday in range(7):
            row = existing.get(weekday)
            if row:
                payload.append(OpeningHoursSerializer(row).data)
            else:
                payload.append(
                    {
                        "weekday": weekday,
                        "weekday_label": WEEKDAY_LABELS[weekday],
                        "opens_at": None,
                        "closes_at": None,
                        "is_closed": True,
                    }
                )
        return Response(payload)


class AvailabilityView(APIView):
    """Public availability for a given date: open slots with remaining capacity."""

    @extend_schema(
        tags=["reservations"],
        parameters=[
            OpenApiParameter(
                name="date",
                type=str,
                location=OpenApiParameter.QUERY,
                required=True,
                description="ISO date (YYYY-MM-DD)",
            ),
        ],
        responses={200: AvailabilitySerializer},
    )
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
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "reservations"

    @extend_schema(
        tags=["reservations"],
        request=ReservationCreateSerializer,
        responses={201: ReservationCreateResponseSerializer},
    )
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

        # Booking is already committed. Guest confirmation + staff Telegram/email
        # are best-effort and must never roll back or fail the HTTP success.
        email_sent = send_reservation_confirmation(reservation)
        if email_sent and not reservation.confirmation_email_sent:
            reservation.confirmation_email_sent = True
            reservation.save(update_fields=["confirmation_email_sent"])

        schedule_reservation_notifications(reservation)

        body = ReservationSerializer(reservation).data
        body["email_sent"] = email_sent
        return Response(body, status=status.HTTP_201_CREATED)
