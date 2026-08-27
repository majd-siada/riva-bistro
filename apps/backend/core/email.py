from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import EmailMessage

logger = logging.getLogger("riva.email")


def _send(subject: str, body: str, to: list[str], reply_to: str | None = None) -> bool:
    """Send one email. Returns True only if the backend accepted it.

    Never raises: callers decide whether a failure is fatal (inquiries) or
    best-effort (reservation confirmation). In development the console backend
    "accepts" the mail (prints it), which is a real send from Django's side —
    we never report success without the backend confirming it.
    """
    recipients = [addr for addr in to if addr]
    if not recipients:
        logger.warning("Email '%s' skipped: no recipient configured", subject)
        return False
    try:
        message = EmailMessage(
            subject=subject,
            body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipients,
            reply_to=[reply_to] if reply_to else None,
        )
        sent = message.send(fail_silently=False)
        return sent > 0
    except Exception:  # noqa: BLE001 - log and report failure to the caller
        logger.exception("Email '%s' failed to send", subject)
        return False


def _notification_recipient() -> str:
    return getattr(settings, "RESTAURANT_NOTIFICATION_EMAIL", "") or ""


def send_reservation_confirmation(reservation) -> bool:
    subject = f"Din bokning på Riva Bistro — {reservation.ref}"
    body = (
        f"Hej {reservation.name},\n\n"
        "Tack för din bokning hos Riva Bistro. Här är dina uppgifter:\n\n"
        f"Bokningsnummer: {reservation.ref}\n"
        f"Datum: {reservation.date:%Y-%m-%d}\n"
        f"Tid: {reservation.time:%H:%M}\n"
        f"Antal gäster: {reservation.party_size}\n"
    )
    if reservation.special_request:
        body += f"Önskemål: {reservation.special_request}\n"
    body += "\nVälkommen!\nRiva Bistro"
    return _send(subject, body, [reservation.email])


def send_contact_message(*, name: str, email: str, message: str) -> bool:
    subject = f"Nytt kontaktmeddelande från {name}"
    body = f"Namn: {name}\nE-post: {email}\n\nMeddelande:\n{message}\n"
    return _send(subject, body, [_notification_recipient()], reply_to=email)


def send_event_inquiry(
    *,
    name: str,
    email: str,
    phone: str = "",
    event_type: str = "",
    guests: str = "",
    date: str = "",
    message: str = "",
) -> bool:
    subject = f"Ny förfrågan om privat event från {name}"
    body = (
        f"Namn: {name}\n"
        f"E-post: {email}\n"
        f"Telefon: {phone or '-'}\n"
        f"Typ av event: {event_type or '-'}\n"
        f"Antal gäster: {guests or '-'}\n"
        f"Önskat datum: {date or '-'}\n\n"
        f"Meddelande:\n{message}\n"
    )
    return _send(subject, body, [_notification_recipient()], reply_to=email)
