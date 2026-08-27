# API Documentation

## Contract source of truth

The OpenAPI schema exported by Django (`drf-spectacular`) is the **only** API contract.

- Schema URL (local): `http://localhost:8000/api/v1/schema/`
- Interactive docs: `http://localhost:8000/api/v1/docs/`

## Versioning

Public HTTP APIs are versioned under `/api/v1/`.

## Public endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health/` | API + database health |
| GET | `/api/v1/menu/categories/` | Menu categories |
| GET | `/api/v1/menu/products/` | Products (`?category=<slug>`, `?featured=true`) |
| GET | `/api/v1/menu/featured/` | Featured dishes (homepage) |
| GET | `/api/v1/menu/products/<slug>/` | Product detail |
| GET | `/api/v1/hours/` | Opening hours |
| GET | `/api/v1/reservations/availability/?date=YYYY-MM-DD` | Bookable slots + remaining capacity |
| POST | `/api/v1/reservations/` | Create a confirmed reservation (backend-enforced availability) |
| POST | `/api/v1/contact/` | Contact message → notification inbox |
| POST | `/api/v1/events/inquiry/` | Private-event inquiry → notification inbox |
| GET | `/api/v1/schema/` · `/api/v1/docs/` | OpenAPI schema + Swagger UI |

Public write endpoints (`reservations`, `contact`, `events/inquiry`) do not use
session auth, so they work for anonymous guests without CSRF tokens.

## Admin endpoints (staff session, `IsAdminUser`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/auth/csrf/` | Set CSRF cookie |
| POST | `/api/v1/admin/auth/login/` · `logout/` | Session login/logout |
| GET | `/api/v1/admin/auth/me/` | Current admin session |
| GET | `/api/v1/admin/overview/` | Dashboard KPIs + today's reservations |
| GET/PATCH | `/api/v1/admin/reservations/` · `/<id>/` | List/filter + status update |
| GET/PUT | `/api/v1/admin/hours/` | Opening hours |
| GET/POST/DELETE | `/api/v1/admin/closures/` · `/<id>/` | Special closures |
| GET/PATCH | `/api/v1/admin/settings/` | Reservation settings (capacity, `production_ready`) |
| GET/POST/PATCH/DELETE | `/api/v1/admin/menu/categories/` · `/products/` | Menu CRUD (same catalog data) |
| POST | `/api/v1/admin/menu/products/<id>/image/` | Upload dish image (multipart) |

Admin write requests use Django session auth + CSRF (`X-CSRFToken`). The
frontend admin client handles the token automatically.

Never invent request/response shapes in the frontend; the OpenAPI schema is the
contract.
