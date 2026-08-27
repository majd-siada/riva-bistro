from __future__ import annotations

from datetime import date as date_cls

from django.db.models import Q, Sum
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from reservations.models import (
    OpeningHours,
    Reservation,
    ReservationSettings,
    SpecialClosure,
)
from reservations.serializers import (
    OpeningHoursSerializer,
    ReservationSerializer,
    ReservationSettingsSerializer,
    ReservationStatusSerializer,
    SpecialClosureSerializer,
)


class AdminReservationListView(APIView):
    permission_classes = [IsAdminUser]

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
        return Response(ReservationSerializer(qs[:500], many=True).data)


class AdminReservationDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, pk: int) -> Reservation | None:
        return Reservation.objects.filter(pk=pk).first()

    def get(self, request: Request, pk: int) -> Response:
        reservation = self.get_object(pk)
        if not reservation:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(ReservationSerializer(reservation).data)

    def patch(self, request: Request, pk: int) -> Response:
        reservation = self.get_object(pk)
        if not reservation:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = ReservationStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reservation.status = serializer.validated_data["status"]
        reservation.save(update_fields=["status", "updated_at"])
        return Response(ReservationSerializer(reservation).data)


class AdminHoursView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request: Request) -> Response:
        return Response(OpeningHoursSerializer(OpeningHours.objects.all(), many=True).data)

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
        return Response(OpeningHoursSerializer(OpeningHours.objects.all(), many=True).data)


class AdminClosureListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request: Request) -> Response:
        return Response(
            SpecialClosureSerializer(SpecialClosure.objects.all(), many=True).data
        )

    def post(self, request: Request) -> Response:
        serializer = SpecialClosureSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminClosureDetailView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request: Request, pk: int) -> Response:
        SpecialClosure.objects.filter(pk=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminSettingsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request: Request) -> Response:
        return Response(ReservationSettingsSerializer(ReservationSettings.load()).data)

    def patch(self, request: Request) -> Response:
        config = ReservationSettings.load()
        serializer = ReservationSettingsSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AdminReservationOverviewView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request: Request) -> Response:
        today = date_cls.today()
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
