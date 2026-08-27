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


@admin.register(SpecialClosure)
class SpecialClosureAdmin(admin.ModelAdmin):
    list_display = ["date", "reason"]


@admin.register(ReservationSettings)
class ReservationSettingsAdmin(admin.ModelAdmin):
    list_display = ["max_guests_per_slot", "slot_interval_minutes", "production_ready"]


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ["ref", "name", "party_size", "date", "time", "status"]
    list_filter = ["status", "date"]
    search_fields = ["ref", "name", "email", "phone"]
    readonly_fields = ["ref", "created_at", "updated_at"]
