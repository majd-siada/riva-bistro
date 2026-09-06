"""Format and dispatch staff notifications after a reservation is committed."""

from __future__ import annotations

import logging
from html import escape

from django.db import transaction

from core.notifications.staff_email import send_staff_reservation_email
from core.notifications.telegram import send_telegram_message

logger = logging.getLogger("riva.notifications.reservation")


def format_reservation_telegram(reservation) -> str:
    status_label = reservation.get_status_display()
    return (
        "Riva Bistro\n"
        "New reservation\n"
        f"Reference: {reservation.ref}\n"
        f"Name: {reservation.name}\n"
        f"Phone: {reservation.phone}\n"
        f"Email: {reservation.email or '—'}\n"
        f"Date: {reservation.date:%Y-%m-%d}\n"
        f"Time: {reservation.time:%H:%M}\n"
        f"Party size: {reservation.party_size}\n"
        f"Status: {status_label}"
    )


def format_reservation_email(reservation) -> tuple[str, str, str]:
    """Return (subject, text_body, html_body)."""
    status_label = reservation.get_status_display()
    subject = f"Riva Bistro — New reservation {reservation.ref}"
    text = (
        "Riva Bistro\n"
        "New reservation\n\n"
        f"Reference: {reservation.ref}\n"
        f"Customer name: {reservation.name}\n"
        f"Phone: {reservation.phone}\n"
        f"Email: {reservation.email or '—'}\n"
        f"Date: {reservation.date:%Y-%m-%d}\n"
        f"Time: {reservation.time:%H:%M}\n"
        f"Party size: {reservation.party_size}\n"
        f"Status: {status_label}\n"
    )
    if reservation.special_request:
        text += f"Special request: {reservation.special_request}\n"

    rows = [
        ("Reference", reservation.ref),
        ("Customer name", reservation.name),
        ("Phone", reservation.phone),
        ("Email", reservation.email or "—"),
        ("Date", f"{reservation.date:%Y-%m-%d}"),
        ("Time", f"{reservation.time:%H:%M}"),
        ("Party size", str(reservation.party_size)),
        ("Status", status_label),
    ]
    if reservation.special_request:
        rows.append(("Special request", reservation.special_request))

    row_html = "".join(
        f"<tr><th align='left' style='padding:4px 12px 4px 0;color:#555;'>"
        f"{escape(label)}</th>"
        f"<td style='padding:4px 0;'>{escape(value)}</td></tr>"
        for label, value in rows
    )
    html = (
        "<div style='font-family:system-ui,sans-serif;font-size:15px;color:#111;'>"
        "<h2 style='margin:0 0 8px;'>Riva Bistro</h2>"
        "<p style='margin:0 0 16px;'><strong>New reservation</strong></p>"
        f"<table>{row_html}</table>"
        "</div>"
    )
    return subject, text, html


def _claim_notification(reservation_id: int, flag_field: str) -> bool:
    """Atomically claim a notification channel. Returns True if this caller owns it.

    Using UPDATE … WHERE flag=False prevents duplicate sends when two post-commit
    callbacks (or an idempotent create retry racing a late callback) run together.
    """
    from reservations.models import Reservation

    claimed = Reservation.objects.filter(pk=reservation_id, **{flag_field: False}).update(
        **{flag_field: True}
    )
    return claimed == 1


def _release_notification(reservation_id: int, flag_field: str) -> None:
    """Allow a later retry if the provider send failed after a successful claim."""
    from reservations.models import Reservation

    Reservation.objects.filter(pk=reservation_id).update(**{flag_field: False})


def notify_reservation_created(reservation) -> dict[str, bool]:
    """Send Telegram + staff email after DB commit. Never raises.

    Skips channels already claimed/sent (retry / idempotent create path).
    """
    results = {"telegram": False, "email": False}
    reservation_id = reservation.pk
    ref = getattr(reservation, "ref", reservation_id)

    if _claim_notification(reservation_id, "telegram_notified"):
        try:
            ok = send_telegram_message(format_reservation_telegram(reservation))
            results["telegram"] = ok
            if not ok:
                _release_notification(reservation_id, "telegram_notified")
        except Exception:  # noqa: BLE001
            logger.exception("Telegram notification raised for ref=%s", ref)
            _release_notification(reservation_id, "telegram_notified")
    else:
        logger.info("Telegram notify skipped (already claimed) ref=%s", ref)

    if _claim_notification(reservation_id, "staff_email_notified"):
        try:
            subject, text, html = format_reservation_email(reservation)
            ok = send_staff_reservation_email(subject=subject, text=text, html=html)
            results["email"] = ok
            if not ok:
                _release_notification(reservation_id, "staff_email_notified")
        except Exception:  # noqa: BLE001
            logger.exception("Staff email notification raised for ref=%s", ref)
            _release_notification(reservation_id, "staff_email_notified")
    else:
        logger.info("Staff email notify skipped (already claimed) ref=%s", ref)

    return results


def schedule_reservation_notifications(reservation) -> dict[str, bool]:
    """Run notifications after the surrounding transaction commits.

    Returns channel results when the callback can run immediately (no open
    atomic block — the usual path after ``create_reservation`` already
    committed). Inside an atomic block the work is deferred via ``on_commit``
    and this returns ``{"telegram": False, "email": False}`` as placeholders.
    """
    reservation_id = reservation.pk
    results: dict[str, bool] = {"telegram": False, "email": False}

    def _run() -> None:
        nonlocal results
        from reservations.models import Reservation

        try:
            row = Reservation.objects.get(pk=reservation_id)
        except Reservation.DoesNotExist:
            logger.warning("Reservation %s missing at notify time", reservation_id)
            return
        results = notify_reservation_created(row)

    transaction.on_commit(_run)
    return results
