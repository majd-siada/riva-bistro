from django.contrib import admin

from reservations.models import (
    OpeningHours,
    Reservation,
    ReservationSettings,
    SpecialClosure,
)


@admin.register(OpeningHours)
class OpeningHoursAdmin(admin.ModelAdmin):
    list_display = ["weekday", "opens_at", "closes_at", "is_closed"]
    ordering = ["weekday"]


@admin.register(SpecialClosure)
class SpecialClosureAdmin(admin.ModelAdmin):
    list_display = ["date", "reason"]
    ordering = ["-date"]
    search_fields = ["reason"]


@admin.register(ReservationSettings)
class ReservationSettingsAdmin(admin.ModelAdmin):
    list_display = [
        "max_guests_per_slot",
        "max_party_size",
        "booking_horizon_days",
        "booking_lead_minutes",
        "production_ready",
    ]


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = [
        "ref",
        "date",
        "time",
        "party_size",
        "name",
        "phone",
        "status",
        "telegram_notified",
        "staff_email_notified",
        "confirmation_email_sent",
    ]
    list_filter = [
        "status",
        "date",
        "telegram_notified",
        "staff_email_notified",
        "confirmation_email_sent",
    ]
    search_fields = ["ref", "name", "email", "phone"]
    readonly_fields = [
        "ref",
        "created_at",
        "updated_at",
        "telegram_notified",
        "staff_email_notified",
        "confirmation_email_sent",
    ]
    date_hierarchy = "date"
    ordering = ["-date", "-time"]
