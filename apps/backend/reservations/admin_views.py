from __future__ import annotations

from datetime import date as date_cls

from django.db.models import Q, Sum
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.notifications import notify_reservation_created
from reservations.models import (
    OpeningHours,
    Reservation,
    ReservationSettings,
    SpecialClosure,
)
from reservations.serializers import (
    AdminOverviewSerializer,
    AdminReservationSerializer,
    OpeningHoursSerializer,
    ReservationSerializer,
    ReservationSettingsSerializer,
    ReservationStatusSerializer,
    SpecialClosureSerializer,
)


class AdminReservationListView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(
        tags=["admin"],
        parameters=[
            OpenApiParameter(name="date", type=str, location=OpenApiParameter.QUERY),
            OpenApiParameter(name="status", type=str, location=OpenApiParameter.QUERY),
            OpenApiParameter(name="q", type=str, location=OpenApiParameter.QUERY),
        ],
        responses={200: AdminReservationSerializer(many=True)},
    )
    def get(self, request: Request) -> Response:
        qs = Reservation.objects.all()
        date_param = request.query_params.get("date")
        status_param = request.query_params.get("status")
        query = request.query_params.get("q")

        if date_param:
            try:
                qs = qs.filter(date=date_cls.fromisoformat(date_param))
            except ValueError:
                return Response(
                    {"detail": "Ogiltigt datum."}, status=status.HTTP_400_BAD_REQUEST
                )
        if status_param:
            qs = qs.filter(status=status_param)
        if query:
            qs = qs.filter(
                Q(name__icontains=query)
                | Q(email__icontains=query)
                | Q(phone__icontains=query)
                | Q(ref__icontains=query)
            )
        return Response(AdminReservationSerializer(qs[:500], many=True).data)


class AdminReservationDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, pk: int) -> Reservation | None:
        return Reservation.objects.filter(pk=pk).first()

    @extend_schema(tags=["admin"], responses={200: AdminReservationSerializer})
    def get(self, request: Request, pk: int) -> Response:
        reservation = self.get_object(pk)
        if not reservation:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(AdminReservationSerializer(reservation).data)

    @extend_schema(
        tags=["admin"],
        request=ReservationStatusSerializer,
        responses={200: AdminReservationSerializer},
    )
    def patch(self, request: Request, pk: int) -> Response:
        reservation = self.get_object(pk)
        if not reservation:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = ReservationStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reservation.status = serializer.validated_data["status"]
        reservation.save(update_fields=["status", "updated_at"])
        return Response(AdminReservationSerializer(reservation).data)

    @extend_schema(tags=["admin"], responses={204: None})
    def delete(self, request: Request, pk: int) -> Response:
        reservation = self.get_object(pk)
        if not reservation:
            return Response(status=status.HTTP_404_NOT_FOUND)
        reservation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminReservationBulkDeleteView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(tags=["admin"], request=dict, responses={200: dict})
    def post(self, request: Request) -> Response:
        ids = request.data.get("ids")
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
        deleted, _ = Reservation.objects.filter(pk__in=clean_ids).delete()
        return Response({"deleted": deleted})


class AdminHoursView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(tags=["admin"], responses={200: OpeningHoursSerializer(many=True)})
    def get(self, request: Request) -> Response:
        return Response(OpeningHoursSerializer(OpeningHours.objects.all(), many=True).data)

    @extend_schema(
        tags=["admin"],
        request=OpeningHoursSerializer(many=True),
        responses={200: OpeningHoursSerializer(many=True)},
    )
    def put(self, request: Request) -> Response:
        serializer = OpeningHoursSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        for row in serializer.validated_data:
            OpeningHours.objects.update_or_create(
                weekday=row["weekday"],
                defaults={
                    "opens_at": row.get("opens_at"),
                    "closes_at": row.get("closes_at"),
                    "is_closed": row.get("is_closed", False),
                },
            )
        from core.revalidate import trigger_frontend_revalidation

        trigger_frontend_revalidation(["/", "/kontakt", "/boka", "/meny"])
        return Response(OpeningHoursSerializer(OpeningHours.objects.all(), many=True).data)


class AdminClosureListView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(tags=["admin"], responses={200: SpecialClosureSerializer(many=True)})
    def get(self, request: Request) -> Response:
        return Response(
            SpecialClosureSerializer(SpecialClosure.objects.all(), many=True).data
        )

    @extend_schema(
        tags=["admin"],
        request=SpecialClosureSerializer,
        responses={201: SpecialClosureSerializer},
    )
    def post(self, request: Request) -> Response:
        serializer = SpecialClosureSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminClosureDetailView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(tags=["admin"], responses={204: None})
    def delete(self, request: Request, pk: int) -> Response:
        SpecialClosure.objects.filter(pk=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminSettingsView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(tags=["admin"], responses={200: ReservationSettingsSerializer})
    def get(self, request: Request) -> Response:
        return Response(ReservationSettingsSerializer(ReservationSettings.load()).data)

    @extend_schema(
        tags=["admin"],
        request=ReservationSettingsSerializer,
        responses={200: ReservationSettingsSerializer},
    )
    def patch(self, request: Request) -> Response:
        config = ReservationSettings.load()
        serializer = ReservationSettingsSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AdminReservationOverviewView(APIView):
    permission_classes = [IsAdminUser]

    @extend_schema(tags=["admin"], responses={200: AdminOverviewSerializer})
    def get(self, request: Request) -> Response:
        today = timezone.localdate()
        todays = Reservation.objects.filter(
            date=today, status__in=Reservation.ACTIVE_STATUSES
        )
        upcoming = Reservation.objects.filter(
            date__gt=today, status__in=Reservation.ACTIVE_STATUSES
        )
        config = ReservationSettings.load()
        return Response(
            {
                "today_count": todays.count(),
                "today_guests": int(
                    todays.aggregate(total=Sum("party_size"))["total"] or 0
                ),
                "upcoming_count": upcoming.count(),
                "production_ready": config.production_ready,
                "max_guests_per_slot": config.max_guests_per_slot,
                "todays_reservations": ReservationSerializer(
                    todays.order_by("time"), many=True
                ).data,
            }
        )


class AdminReservationResendNotificationsView(APIView):
    """Retry staff Telegram/email for one reservation (idempotent claim flags)."""

    permission_classes = [IsAdminUser]

    @extend_schema(
        tags=["admin"],
        request=None,
        responses={200: AdminReservationSerializer},
    )
    def post(self, request: Request, pk: int) -> Response:
        reservation = Reservation.objects.filter(pk=pk).first()
        if not reservation:
            return Response(status=status.HTTP_404_NOT_FOUND)
        notify_reservation_created(reservation)
        reservation.refresh_from_db()
        return Response(AdminReservationSerializer(reservation).data)
