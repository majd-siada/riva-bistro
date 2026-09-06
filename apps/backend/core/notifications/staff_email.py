"""Staff reservation email via Hostinger Mail API, with Django SMTP fallback.

Hostinger Mail API (verified package ``hostinger_mail_api``):
  - Auth: Bearer token → Configuration(access_token=...)
  - Send: SendApi.send_email(mailbox_resource_id, V1SendRequest)
  - Host: https://api.mail.hostinger.com

Required env when using Hostinger Mail API:
  HOSTINGER_MAIL_API_TOKEN
  HOSTINGER_MAIL_MAILBOX_RESOURCE_ID
  RESTAURANT_NOTIFICATION_EMAIL  (recipient)

If Hostinger is not fully configured, or the Mail API send fails, falls
back to the existing Django EMAIL_* / SMTP path used elsewhere (does not
replace guest confirmations).
"""

from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger("riva.notifications.email")

REQUEST_TIMEOUT_SECONDS = 10.0


def _recipient() -> str:
    return (getattr(settings, "RESTAURANT_NOTIFICATION_EMAIL", "") or "").strip()


def _hostinger_token() -> str:
    return (getattr(settings, "HOSTINGER_MAIL_API_TOKEN", "") or "").strip()


def _hostinger_mailbox_id() -> str:
    return (getattr(settings, "HOSTINGER_MAIL_MAILBOX_RESOURCE_ID", "") or "").strip()


def hostinger_api_configured() -> bool:
    """True when Hostinger Mail API credentials are present (any recipient)."""
    return bool(_hostinger_token() and _hostinger_mailbox_id())


def hostinger_mail_configured() -> bool:
    return bool(hostinger_api_configured() and _recipient())


def send_email_via_hostinger(
    *,
    to: str,
    subject: str,
    text: str,
    html: str = "",
    display_name: str = "Riva Bistro",
) -> bool:
    """Send one message via Hostinger Mail API to an arbitrary recipient."""
    to = (to or "").strip()
    if not to:
        logger.info("Hostinger send skipped: no recipient")
        return False
    if not hostinger_api_configured():
        logger.info("Hostinger send skipped: API credentials unset")
        return False
    return _send_via_hostinger(
        to=to,
        subject=subject,
        text=text,
        html=html or f"<pre>{text}</pre>",
        display_name=display_name,
    )


def send_staff_reservation_email(*, subject: str, text: str, html: str) -> bool:
    """Send staff notification. Prefer Hostinger Mail API; else Django SMTP.

    If Hostinger is configured but the API call fails (or the package is
    missing), fall back to Django EMAIL_* so staff still get the alert.
    """
    to = _recipient()
    if not to:
        logger.info("Staff reservation email skipped: RESTAURANT_NOTIFICATION_EMAIL unset")
        return False

    if hostinger_mail_configured():
        if _send_via_hostinger(to=to, subject=subject, text=text, html=html):
            return True
        logger.warning(
            "Hostinger Mail API send failed; falling back to Django email backend"
        )
        return _send_via_django(to=to, subject=subject, text=text, html=html)
    return _send_via_django(to=to, subject=subject, text=text, html=html)


def _send_via_hostinger(
    *,
    to: str,
    subject: str,
    text: str,
    html: str,
    display_name: str = "Riva Bistro",
) -> bool:
    """Send via Hostinger only. Returns False on ImportError or API failure.

    Callers decide whether to fall back to Django SMTP.
    """
    try:
        from hostinger_mail_api import ApiClient, Configuration, SendApi
        from hostinger_mail_api.models import V1SendRequest
    except ImportError:
        logger.warning("hostinger_mail_api not installed")
        return False

    configuration = Configuration(access_token=_hostinger_token())
    try:
        with ApiClient(configuration) as api_client:
            api = SendApi(api_client)
            request = V1SendRequest(
                to=[to],
                subject=subject,
                text=text,
                html=html,
                display_name=display_name,
            )
            api.send_email(
                mailbox_resource_id=_hostinger_mailbox_id(),
                v1_send_request=request,
                _request_timeout=REQUEST_TIMEOUT_SECONDS,
            )
        return True
    except Exception:  # noqa: BLE001 — never break booking on provider errors
        logger.exception("Hostinger Mail API send failed")
        return False


def _send_via_django(*, to: str, subject: str, text: str, html: str) -> bool:
    try:
        message = EmailMultiAlternatives(
            subject=subject,
            body=text,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to],
        )
        message.attach_alternative(html, "text/html")
        sent = message.send(fail_silently=False)
        return sent > 0
    except Exception:  # noqa: BLE001
        logger.exception("Django staff reservation email failed")
        return False
