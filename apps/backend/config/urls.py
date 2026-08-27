"""URL configuration for Riva Bistro."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    # Public API
    path("api/v1/", include("core.urls")),
    path("api/v1/menu/", include("catalog.urls")),
    path("api/v1/", include("reservations.urls")),
    # Admin API (protected)
    path("api/v1/admin/auth/", include("core.admin_auth_urls")),
    path("api/v1/admin/menu/", include("catalog.admin_urls")),
    path("api/v1/admin/", include("reservations.admin_urls")),
    # Schema
    path("api/v1/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/v1/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
