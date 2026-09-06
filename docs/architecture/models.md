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

| Layer | Behavior |
|-------|----------|
| Public catalog API | Django responses are not long-cached at the app layer; Next.js `fetch` uses short `revalidate` (e.g. meny `revalidate = 60`). |
| Booking / auth / inquiries | No-store semantics; DRF throttles protect write endpoints. |
| Static frontend | Hostinger/CDN serves the Next build; image optimization via `next/image`. |
| Django cache | Default cache backs DRF throttle counters (cleared between tests). |

Do not invent a separate Redis/CDN product solely for checklist completion — Hostinger + short ISR is the intentional MVP posture.
