# Riva Bistro — Architecture Overview

## System shape

Riva Bistro is a **modular monolith**:

- One Django backend (`apps/backend`)
- One Next.js frontend (`apps/web`)
- One PostgreSQL database
- One generated TypeScript API client (`packages/api-client`)

OpenAPI is the **single source of truth** for the HTTP contract:

```
Django / DRF  →  OpenAPI schema  →  generated TS client  →  Next.js
```

Do not hand-write request/response TypeScript types that duplicate the schema.

## Runtime topology (local)

Docker Compose runs three services:

| Service   | Role                         | Port |
|-----------|------------------------------|------|
| postgres  | PostgreSQL 17                | 5432 |
| backend   | Django + DRF API             | 8000 |
| web       | Next.js App Router frontend  | 3000 |

## Domain boundaries (planned)

| Domain            | Responsibility                                      |
|-------------------|-----------------------------------------------------|
| Core / Health     | Liveness, shared utilities                          |
| Restaurant        | Settings, capacity, identity                        |
| Hours             | Opening hours, seasonal hours, special closures     |
| Availability      | Deterministic booking-slot calculation              |
| Reservations      | Create/cancel/status; booking references            |
| Menu              | Categories, items, prices, availability             |
| Gallery / Media   | MediaAsset metadata + object storage                |
| News              | Articles, publish state                             |
| Notifications     | Telegram delivery state (async, non-transactional)  |
| Admin / Auth      | Authentication, RBAC                                |

## Image storage

Binary files are **never** stored in PostgreSQL. Metadata lives in the DB; bytes live in an S3-compatible object store (local filesystem in development).

## Notifications

Telegram is a side effect. Reservation creation must succeed even if Telegram fails. Delivery is tracked separately (`queued` / `sent` / `failed` / `retrying`).

## Phase status

- **Phase 1 (this milestone):** monorepo, Docker, Django health, Next.js foundation, OpenAPI scaffolding, docs/DX.
- Later phases add reservation domain, CMS, Telegram, premium public UI, and production hardening.
