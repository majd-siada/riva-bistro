# Rate limiting

Application throttles (DRF `ScopedRateThrottle`):

- `reservations` — 30/hour on `POST /api/v1/reservations/`
- `inquiries` — 12/hour on contact and private-event POSTs
- `auth` — 20/hour on admin login

OpenAPI schema and Swagger UI (`/api/v1/schema/`, `/api/v1/docs/`) require a staff session.

Cross-subdomain admin cookies: set `DJANGO_COOKIE_SAMESITE=None`, `DJANGO_COOKIE_DOMAIN=.rivabistro.se`, and `DJANGO_DEBUG=false` so `Secure` is on.

Full production cutover checklist: [`docs/deployment/production-checklist.md`](../deployment/production-checklist.md).

Uploads: JPEG/PNG/WebP magic-byte sniff, max 5 MB.

## Production process & media

- Container image default command is **gunicorn** (`config.wsgi`). Local Compose overrides to `runserver` for hot-reload.
- **WhiteNoise** serves collected static files when `DJANGO_DEBUG=false` (entrypoint runs `collectstatic`).
- Uploaded media lives on local disk (`MEDIA_ROOT`). When `DJANGO_DEBUG=false`, Django serves `/media/` if `MEDIA_SERVE=true` (default). Set `MEDIA_SERVE=false` if nginx/CDN mounts `MEDIA_ROOT` instead. Object storage (S3/R2) is optional later — not required for launch.
