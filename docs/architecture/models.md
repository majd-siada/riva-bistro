# Domain models (code as source of truth)

Short inventory of the live Django models. Prefer reading `models.py` for fields.

## Catalog (`apps/backend/catalog`)

- **Category** — menu sections/courses; optional `parent` for nesting (e.g. RIVAS MENY courses).
- **Product** — dish/drink under a category; price + VAT; optional uploaded `image` (magic-sniffed on admin upload).

## Reservations (`apps/backend/reservations`)

- **OpeningHours** — one row per weekday.
- **SpecialClosure** — one-off closed dates.
- **ReservationSettings** — singleton capacity/horizon; `production_ready` stays false until owner confirms capacity.
- **Reservation** — guest booking row; staff notification flags (`telegram_notified`, `staff_email_notified`).

## Core (`apps/backend/core`)

- Contact / event inquiry models for public forms.
- Gallery items with optional uploaded images (validated).
- Auth uses Django’s built-in `User` (staff only).

No separate ERD tool is required for MVP; this file plus migrations are the schema docs.

## Caching strategy (MVP)

Source of truth: `frontend/src/lib/api.ts` (`CACHE_REVALIDATE_SECONDS` + `resolveFetchCacheOptions`).

| Data | Next.js fetch behavior |
|------|------------------------|
| Menu catalog (`/menu/categories/`, `/menu/products/`, `/menu/featured/`, product by slug) | `revalidate: 60` (aligned with `/meny` page `revalidate = 60`) |
| Opening hours | `revalidate: 300` |
| News | `revalidate: 120` |
| Gallery | `revalidate: 300` |
| Availability, health, auth, reservation/contact/event **writes** | `cache: "no-store"` (default when `revalidate` omitted) |

- Django does **not** long-cache public JSON at the app layer; freshness is controlled by Next fetch revalidation.
- Django’s default cache backs **DRF throttle counters** only.
- Static site assets are served by Hostinger; images use `next/image` (no Redis/CDN product invented for MVP).

Do not claim catalog caching unless catalog fetches pass an explicit `revalidate` (as above).
