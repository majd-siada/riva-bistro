"""URL configuration for Riva Bistro."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.permissions import IsAdminUser

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("core.urls")),
    path("api/v1/menu/", include("catalog.urls")),
    path("api/v1/", include("reservations.urls")),
    path("api/v1/admin/auth/", include("core.admin_auth_urls")),
    path("api/v1/admin/menu/", include("catalog.admin_urls")),
    path("api/v1/admin/", include("reservations.admin_urls")),
    path("api/v1/admin/", include("core.admin_content_urls")),
    path(
        "api/v1/schema/",
        SpectacularAPIView.as_view(permission_classes=[IsAdminUser]),
        name="schema",
    ),
    path(
        "api/v1/docs/",
        SpectacularSwaggerView.as_view(
            url_name="schema", permission_classes=[IsAdminUser]
        ),
        name="swagger-ui",
    ),
]

# django.conf.urls.static.static() is a no-op when DEBUG is false.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
elif settings.MEDIA_SERVE:
    urlpatterns += [
        re_path(
            r"^media/(?P<path>.*)$",
            serve,
            {"document_root": settings.MEDIA_ROOT},
        ),
    ]
