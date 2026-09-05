from __future__ import annotations

from rest_framework import serializers

from reservations.models import (
    OpeningHours,
    Reservation,
    ReservationSettings,
    SpecialClosure,
)


class ReservationCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120, trim_whitespace=True)
    phone = serializers.CharField(max_length=40, trim_whitespace=True)
    email = serializers.EmailField()
    party_size = serializers.IntegerField(min_value=1, max_value=100)
    date = serializers.DateField()
    time = serializers.TimeField()
    special_request = serializers.CharField(
        max_length=1000, allow_blank=True, required=False, default=""
    )

    def validate_name(self, value: str) -> str:
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Ange ditt namn.")
        return value.strip()

    def validate_phone(self, value: str) -> str:
        # Deterministic sanity check only — do not invent country-specific rules.
        digits = "".join(ch for ch in value if ch.isdigit())
        if len(digits) < 7:
            raise serializers.ValidationError("Ange ett giltigt telefonnummer.")
        return value.strip()


class ReservationSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id",
            "ref",
            "name",
            "phone",
            "email",
            "party_size",
            "date",
            "time",
            "special_request",
            "status",
            "status_label",
            "confirmation_email_sent",
            "created_at",
        ]
        read_only_fields = fields


class ReservationStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Reservation.Status.choices)


class OpeningHoursSerializer(serializers.ModelSerializer):
    weekday_label = serializers.CharField(source="get_weekday_display", read_only=True)

    class Meta:
        model = OpeningHours
        fields = ["weekday", "weekday_label", "opens_at", "closes_at", "is_closed"]


class SpecialClosureSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecialClosure
        fields = ["id", "date", "reason"]


class ReservationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReservationSettings
        fields = [
            "max_guests_per_slot",
            "slot_interval_minutes",
            "last_seating_buffer_minutes",
            "max_party_size",
            "booking_lead_minutes",
            "booking_horizon_days",
            "production_ready",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]


class AvailabilitySlotSerializer(serializers.Serializer):
    time = serializers.CharField()
    remaining = serializers.IntegerField()
    available = serializers.BooleanField()


class AvailabilitySerializer(serializers.Serializer):
    date = serializers.CharField()
    enabled = serializers.BooleanField(
        help_text=(
            "Online booking allowed. False when production_ready is False "
            "(and DEBUG is off). Independent of restaurant open/closed."
        )
    )
    closed = serializers.BooleanField(
        help_text=(
            "Restaurant closed for this calendar date (opening hours, special "
            "closure, or date outside the bookable window). Must not be set "
            "merely because online booking is disabled."
        )
    )
    max_party_size = serializers.IntegerField()
    horizon_days = serializers.IntegerField(required=False)
    slots = AvailabilitySlotSerializer(many=True)


class ReservationCreateResponseSerializer(ReservationSerializer):
    email_sent = serializers.BooleanField(read_only=True)

    class Meta(ReservationSerializer.Meta):
        fields = [*ReservationSerializer.Meta.fields, "email_sent"]
        read_only_fields = fields


class AdminOverviewSerializer(serializers.Serializer):
    today_count = serializers.IntegerField()
    today_guests = serializers.IntegerField()
    upcoming_count = serializers.IntegerField()
    production_ready = serializers.BooleanField()
    max_guests_per_slot = serializers.IntegerField()
    todays_reservations = ReservationSerializer(many=True)
