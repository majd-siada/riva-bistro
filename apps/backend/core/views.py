"""Health check API for orchestration and local verification."""

from __future__ import annotations

from django.db import DatabaseError, connection
from django.db.utils import InterfaceError, OperationalError
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    """Lightweight liveness/readiness endpoint.

    Returns 200 when the process is up and the database accepts connections.
    """

    authentication_classes: list = []
    permission_classes: list = []

    @extend_schema(
        tags=["health"],
        summary="Service health",
        description="Reports API and database readiness for local Docker healthchecks.",
        responses={
            200: {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "example": "ok"},
                    "service": {"type": "string", "example": "riva-bistro-backend"},
                    "database": {"type": "string", "example": "ok"},
                },
            },
            503: {
                "type": "object",
                "properties": {
                    "status": {"type": "string", "example": "degraded"},
                    "service": {"type": "string"},
                    "database": {"type": "string", "example": "unavailable"},
                    "detail": {"type": "string"},
                },
            },
        },
    )
    def get(self, request: Request) -> Response:
        db_status = "ok"
        http_status = status.HTTP_200_OK
        payload: dict[str, str] = {
            "status": "ok",
            "service": "riva-bistro-backend",
            "database": db_status,
        }

        try:
            connection.ensure_connection()
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except (OperationalError, InterfaceError, DatabaseError) as exc:
            payload = {
                "status": "degraded",
                "service": "riva-bistro-backend",
                "database": "unavailable",
                "detail": str(exc.__class__.__name__),
            }
            http_status = status.HTTP_503_SERVICE_UNAVAILABLE

        return Response(payload, status=http_status)
