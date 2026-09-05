from __future__ import annotations

import secrets

from django.db import models
from django.utils import timezone

WEEKDAYS = [
    (0, "Måndag"),
    (1, "Tisdag"),
    (2, "Onsdag"),
    (3, "Torsdag"),
    (4, "Fredag"),
    (5, "Lördag"),
    (6, "Söndag"),
]


class OpeningHours(models.Model):
    """One row per weekday. Admin-managed; drives the booking time slots."""

    weekday = models.PositiveSmallIntegerField(choices=WEEKDAYS, unique=True)
    opens_at = models.TimeField(null=True, blank=True)
    closes_at = models.TimeField(null=True, blank=True)
    is_closed = models.BooleanField(default=False)

    class Meta:
        ordering = ["weekday"]
        verbose_name = "Öppettid"
        verbose_name_plural = "Öppettider"

    def __str__(self) -> str:
        label = dict(WEEKDAYS)[self.weekday]
        if self.is_closed or self.opens_at is None or self.closes_at is None:
            return f"{label}: stängt"
        return f"{label}: {self.opens_at:%H:%M}–{self.closes_at:%H:%M}"


class SpecialClosure(models.Model):
    """A one-off closed date (holiday, private booking, etc.)."""

    date = models.DateField(unique=True)
    reason = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["date"]
        verbose_name = "Specialstängning"
        verbose_name_plural = "Specialstängningar"

    def __str__(self) -> str:
        return f"{self.date} — {self.reason or 'stängt'}"


class ReservationSettings(models.Model):
    """Singleton booking configuration. Edited by staff in the admin."""

    max_guests_per_slot = models.PositiveIntegerField(default=20)
    slot_interval_minutes = models.PositiveIntegerField(default=30)
    last_seating_buffer_minutes = models.PositiveIntegerField(default=60)
    max_party_size = models.PositiveIntegerField(default=12)
    booking_lead_minutes = models.PositiveIntegerField(default=60)
    booking_horizon_days = models.PositiveIntegerField(default=90)
    # Instant confirmation only goes live in production once staff have set a
    # real capacity and flipped this on. In DEBUG we always allow it (dev
    # placeholder capacity). See reservations.availability.instant_booking_enabled.
    production_ready = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Bokningsinställning"
        verbose_name_plural = "Bokningsinställningar"

    def __str__(self) -> str:
        return "Bokningsinställningar"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls) -> ReservationSettings:
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Reservation(models.Model):
    class Status(models.TextChoices):
        CONFIRMED = "confirmed", "Bekräftad"
        SEATED = "seated", "Anländ"
        CANCELLED = "cancelled", "Avbokad"
        NO_SHOW = "no_show", "Uteblev"

    ACTIVE_STATUSES = ["confirmed", "seated"]

    ref = models.CharField(max_length=12, unique=True, editable=False)
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=40)
    email = models.EmailField()
    party_size = models.PositiveIntegerField()
    date = models.DateField()
    time = models.TimeField()
    special_request = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.CONFIRMED
    )
    confirmation_email_sent = models.BooleanField(default=False)
    # Staff notification flags — set only after a successful post-commit send.
    # Prevents duplicate Telegram/email alerts on idempotent create retries.
    telegram_notified = models.BooleanField(default=False)
    staff_email_notified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "time", "created_at"]
        indexes = [
            models.Index(fields=["date", "time"]),
            models.Index(fields=["status"]),
        ]
        verbose_name = "Bokning"
        verbose_name_plural = "Bokningar"

    def __str__(self) -> str:
        return f"{self.ref} — {self.name} ({self.party_size} pers, {self.date} {self.time:%H:%M})"

    @staticmethod
    def generate_ref() -> str:
        alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        return "RB-" + "".join(secrets.choice(alphabet) for _ in range(6))

    def save(self, *args, **kwargs):
        if not self.ref:
            ref = self.generate_ref()
            while Reservation.objects.filter(ref=ref).exists():
                ref = self.generate_ref()
            self.ref = ref
        super().save(*args, **kwargs)

    @property
    def is_active(self) -> bool:
        return self.status in self.ACTIVE_STATUSES

    @property
    def is_past(self) -> bool:
        return self.date < timezone.localdate()
