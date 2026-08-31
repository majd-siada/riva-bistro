from __future__ import annotations

from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.serializers import AdminSessionSerializer, DetailResponseSerializer, LoginSerializer


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfView(APIView):
    """Sets the csrftoken cookie so the admin client can send X-CSRFToken."""

    authentication_classes: list = []
    permission_classes: list = []

    @extend_schema(tags=["admin"], responses={200: DetailResponseSerializer})
    def get(self, request: Request) -> Response:
        return Response({"detail": "CSRF cookie set"})


class LoginView(APIView):
    # Anonymous login: authenticate manually, then establish the session.
    authentication_classes: list = []
    permission_classes: list = []

    @extend_schema(
        tags=["admin"],
        request=LoginSerializer,
        responses={200: AdminSessionSerializer},
    )
    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )
        if user is None or not user.is_active:
            return Response(
                {"detail": "Fel användarnamn eller lösenord."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_staff:
            return Response(
                {"detail": "Kontot saknar administratörsbehörighet."},
                status=status.HTTP_403_FORBIDDEN,
            )
        login(request, user)
        return Response(
            {"authenticated": True, "username": user.username, "is_staff": user.is_staff}
        )


class LogoutView(APIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminSessionSerializer

    @extend_schema(tags=["admin"], responses={200: AdminSessionSerializer})
    def post(self, request: Request) -> Response:
        logout(request)
        return Response({"authenticated": False})


class MeView(APIView):
    """Returns the current admin session state (200 always, client-friendly)."""

    @extend_schema(tags=["admin"], responses={200: AdminSessionSerializer})
    def get(self, request: Request) -> Response:
        user = request.user
        if user.is_authenticated and user.is_staff:
            return Response(
                {"authenticated": True, "username": user.username, "is_staff": True}
            )
        return Response({"authenticated": False})
