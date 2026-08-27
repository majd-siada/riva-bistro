from django.urls import path

from core.auth_views import CsrfView, LoginView, LogoutView, MeView

urlpatterns = [
    path("csrf/", CsrfView.as_view(), name="admin-csrf"),
    path("login/", LoginView.as_view(), name="admin-login"),
    path("logout/", LogoutView.as_view(), name="admin-logout"),
    path("me/", MeView.as_view(), name="admin-me"),
]
