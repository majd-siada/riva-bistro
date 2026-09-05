"""Best-effort staff notifications for reservations (Telegram + email).

Never raise into the booking HTTP path. Never log secrets.
"""

from core.notifications.reservation import (
    notify_reservation_created,
    schedule_reservation_notifications,
)

__all__ = ["notify_reservation_created", "schedule_reservation_notifications"]