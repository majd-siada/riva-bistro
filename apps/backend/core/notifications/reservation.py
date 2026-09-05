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


def notify_reservation_created(reservation) -> dict[str, bool]:
    """Send Telegram + staff email after DB commit. Never raises.

    Skips channels already marked sent (retry / idempotent create path).
    """
    results = {"telegram": False, "email": False}
    try:
        reservation.refresh_from_db(
            fields=["telegram_notified", "staff_email_notified", "ref"]
        )
    except Exception:  # noqa: BLE001
        logger.exception("Could not refresh reservation before notify")
        return results

    update_fields: list[str] = []

    if not reservation.telegram_notified:
        try:
            ok = send_telegram_message(format_reservation_telegram(reservation))
            results["telegram"] = ok
            if ok:
                reservation.telegram_notified = True
                update_fields.append("telegram_notified")
        except Exception:  # noqa: BLE001
            logger.exception("Telegram notification raised for ref=%s", reservation.ref)

    if not reservation.staff_email_notified:
        try:
            subject, text, html = format_reservation_email(reservation)
            ok = send_staff_reservation_email(subject=subject, text=text, html=html)
            results["email"] = ok
            if ok:
                reservation.staff_email_notified = True
                update_fields.append("staff_email_notified")
        except Exception:  # noqa: BLE001
            logger.exception("Staff email notification raised for ref=%s", reservation.ref)

    if update_fields:
        try:
            reservation.save(update_fields=update_fields)
        except Exception:  # noqa: BLE001
            logger.exception("Failed to persist notification flags for ref=%s", reservation.ref)

    return results


def schedule_reservation_notifications(reservation) -> None:
    """Run notifications only after the surrounding transaction commits."""
    reservation_id = reservation.pk

    def _run() -> None:
        from reservations.models import Reservation

        try:
            row = Reservation.objects.get(pk=reservation_id)
        except Reservation.DoesNotExist:
            logger.warning("Reservation %s missing at notify time", reservation_id)
            return
        notify_reservation_created(row)

    transaction.on_commit(_run)
