"""Best-effort on-demand revalidation of the Next.js public site.

Configured via FRONTEND_REVALIDATE_URL + FRONTEND_REVALIDATE_SECRET.
Never raises into API handlers — log and continue if misconfigured or unreachable.
"""

from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request

from django.db import transaction

logger = logging.getLogger("riva.revalidate")

DEFAULT_PATHS = ["/", "/meny", "/galleri", "/kontakt", "/om-oss", "/boka"]
MENU_PATHS = ["/", "/meny"]
GALLERY_PATHS = ["/", "/galleri"]
HOURS_PATHS = ["/", "/kontakt", "/boka", "/meny"]


def trigger_frontend_revalidation(paths: list[str] | None = None) -> bool:
    url = (os.getenv("FRONTEND_REVALIDATE_URL") or "").strip()
    secret = (os.getenv("FRONTEND_REVALIDATE_SECRET") or "").strip()
    if not url or not secret:
        logger.info("Frontend revalidation skipped: URL or secret unset")
        return False

    payload = json.dumps({"paths": paths or DEFAULT_PATHS}).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {secret}",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            ok = 200 <= response.status < 300
            if not ok:
                logger.warning("Frontend revalidation non-2xx: %s", response.status)
            return ok
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError) as exc:
        logger.warning("Frontend revalidation failed: %s", type(exc).__name__)
        return False


def schedule_frontend_revalidation(paths: list[str] | None = None) -> None:
    """Queue revalidation after the current DB transaction commits."""
    path_list = list(paths) if paths is not None else list(DEFAULT_PATHS)

    def _run() -> None:
        trigger_frontend_revalidation(path_list)

    transaction.on_commit(_run)
