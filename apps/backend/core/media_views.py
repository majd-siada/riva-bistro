"""Serve MEDIA_ROOT with browser/CDN-friendly Cache-Control headers."""

from __future__ import annotations

from django.conf import settings
from django.http import HttpRequest, HttpResponse
from django.views.static import serve as static_serve

# One week: Next.js Image optimizer and browsers can reuse; admin uploads
# use new filenames so stale content is uncommon. On-demand revalidation
# refreshes HTML/JSON that point at new /media/ paths.
MEDIA_CACHE_CONTROL = "public, max-age=604800"


def serve_media(request: HttpRequest, path: str) -> HttpResponse:
    response = static_serve(request, path, document_root=settings.MEDIA_ROOT)
    if response.status_code == 200:
        response["Cache-Control"] = MEDIA_CACHE_CONTROL
    return response
