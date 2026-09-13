"""Allow Next.js /api/revalidate to verify Bearer tokens against the VPS secret.

Used when Hostinger has not yet set FRONTEND_REVALIDATE_SECRET locally — the
frontend delegates auth to this endpoint so admin saves still refresh the site.
"""

from __future__ import annotations

import os
import secrets

from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


class RevalidateAuthView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request: Request) -> Response:
        expected = (os.getenv("FRONTEND_REVALIDATE_SECRET") or "").strip()
        auth = request.headers.get("Authorization") or ""
        token = auth[7:].strip() if auth.startswith("Bearer ") else ""
        if (
            expected
            and token
            and secrets.compare_digest(token, expected)
        ):
            return Response({"ok": True})
        return Response({"detail": "Unauthorized."}, status=401)
