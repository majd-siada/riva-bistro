# Production runbook — Riva Bistro

Companion to [production-checklist.md](./production-checklist.md).  
This document covers **how to deploy and verify** the already-working VPS + Hostinger architecture. It does **not** redesign hosting.

**Do not put secrets in this file.** Values live in the VPS `.env` and Hostinger env UI only.

Architecture (unchanged):

| Surface | Host | Stack |
|---------|------|--------|
| `https://rivabistro.se` | Hostinger Node | Next.js |
| `https://api.rivabistro.se` | Ubuntu VPS | Docker + gunicorn + Nginx + Let's Encrypt + host PostgreSQL |

Reservations stay **disabled** until an operator intentionally sets
`production_ready=true` in admin **after** confirming capacity settings.
Official weekly hours (single source: `apps/backend/reservations/official_hours.py`):

| Day | Hours |
|-----|-------|
| Mon–Thu | 10:30–21:00 |
| Friday | 11:30–00:00 (midnight end-of-day) |
| Saturday | 10:30–23:00 |
| Sunday | 10:30–21:00 |

`seed_reservations` fills missing/blank weekdays from that module and always leaves
`production_ready=false`. Do not invent hours or flip that flag from this runbook.

---

## Prerequisites

- VPS `.env` already contains production secrets (`DJANGO_SECRET_KEY`, `DATABASE_URL`, CORS/CSRF hosts, cookie domain, etc.). See checklist section C.
- Hostinger has `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, `INTERNAL_API_URL` set to production HTTPS URLs (rebuild after any change).
- Repo checked out on the VPS at the deploy path you already use.

Use **`docker-compose.production.yml` only** on the VPS. Never deploy with the root `docker-compose.yml` (local Postgres + `runserver` override).

---

## Build / deploy (API host)

From the repo root on the VPS:

```bash
git pull --ff-only
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d
```

The image entrypoint:

1. Waits for PostgreSQL (`DATABASE_URL` preferred)
2. Runs `migrate --noinput`
3. Runs `collectstatic --noinput` when `DJANGO_DEBUG` is not true
4. Starts **gunicorn** (image CMD — not `runserver`)

### Migrations only (if you need them outside a full restart)

```bash
docker compose -f docker-compose.production.yml exec backend python manage.py migrate --noinput
```

### Restart

```bash
docker compose -f docker-compose.production.yml restart backend
```

### Logs

```bash
docker compose -f docker-compose.production.yml logs -f --tail=200 backend
docker compose -f docker-compose.production.yml ps
```

### Rollback

```bash
git log --oneline -n 10
git checkout <known-good-sha>
docker compose -f docker-compose.production.yml up -d --build
```

If the database migration is irreversible, restore the Postgres backup taken before deploy, then check out the previous image/sha.

---

## Frontend (Hostinger)

After pulling the same commit:

1. Confirm Hostinger env (no localhost):
   - `NEXT_PUBLIC_SITE_URL=https://rivabistro.se`
   - `NEXT_PUBLIC_API_URL=https://api.rivabistro.se`
   - `INTERNAL_API_URL=https://api.rivabistro.se` (or the internal URL you already use)
2. `npm ci && npm run build` (or Hostinger’s build button)
3. Ensure the start command serves the standalone output (existing Hostinger sync/postbuild)

Do **not** bake `NEXT_PUBLIC_API_URL=http://localhost:8000` into a production build.

---

## Health checks / SSL

```bash
# TLS
curl -fsSI https://rivabistro.se | head -n 1
curl -fsSI https://api.rivabistro.se | head -n 1

# API health (expects HTTP 200 and database ok)
curl -fsS https://api.rivabistro.se/api/v1/health/
```

Optional local helper (never prints secrets):

```bash
./scripts/production-check.sh
```

---

## API verification

```bash
curl -fsS https://api.rivabistro.se/api/v1/health/
curl -fsS https://api.rivabistro.se/api/v1/menu/categories/ | head -c 200
curl -fsS https://api.rivabistro.se/api/v1/menu/products/ | head -c 200
curl -fsS https://api.rivabistro.se/api/v1/menu/featured/ | head -c 200
curl -fsS https://api.rivabistro.se/api/v1/hours/
curl -fsS "https://api.rivabistro.se/api/v1/reservations/availability/?date=$(date -I -d '+2 days')"
```

Menu seed (only if you intentionally need to re-seed; does not invent hours):

```bash
docker compose -f docker-compose.production.yml exec backend python manage.py seed_menu
```

---

## Frontend verification

```bash
curl -fsSI https://rivabistro.se | head -n 5
curl -fsSI https://rivabistro.se/meny | head -n 5
curl -fsSI https://rivabistro.se/boka | head -n 5
```

In the browser: home, meny, boka, admin login path. Media under `/media/` should load from the API origin.

---

## Reservation verification (must stay gated)

Expected while `production_ready=false` (even with real hours configured):

- `GET /api/v1/hours/` → weekdays with owner-confirmed opens/closes
- `GET /api/v1/reservations/availability/?date=...` → `enabled: false` (slots only once ready)
- `POST /api/v1/reservations/` → **503** with `code: not_enabled` when not production-ready (with `DJANGO_DEBUG=false`)

### Seed safety (do not overwrite owner hours)

```bash
# Safe: creates missing weekdays + fills blank stubs (null opens/closes).
# Never flips production_ready. Never overwrites rows that already have times.
docker compose -f docker-compose.production.yml exec backend \
  python manage.py seed_reservations

# Overwrites ALL weekdays with the official schedule from official_hours.py.
# Use only when applying the restaurant's official hours over empty/wrong stubs.
# docker compose -f docker-compose.production.yml exec backend \
#   python manage.py seed_reservations --force-hours
```

Do **not** run `--force-hours` on production after the restaurant owner has customized
hours in Admin to something other than the official schedule.

If `GET /api/v1/hours/` returns every weekday `is_closed: true` with null times, online
availability cannot offer slots. Prefer `seed_reservations` (no flag) first — it fills
missing/blank rows with the official schedule. Use `--force-hours` only if rows exist
with incorrect non-null times and the owner confirms the official schedule should replace them.

### Admin checks (no credentials in this doc)

In Django Admin the owner should be able to:

- list / filter / search reservations by date, status, customer
- open a reservation and see date, time, party size, contact fields
- change status when needed (`confirmed` / `seated` / `cancelled` / `no_show`)
- manage opening hours and special closures
- view `ReservationSettings` (capacity, horizon, `production_ready`)

**Human / business steps before enabling bookings (BUSINESS INPUT REQUIRED):**

1. Confirm hours + special closures in Admin → Öppettider
2. Confirm capacity / lead time / horizon in Admin → Inställningar
3. Only then set **`production_ready = true`**

Do not enable bookings from deploy scripts. Do not reset admin passwords from this runbook.

---

## Django deploy checks (optional, on VPS)

```bash
docker compose -f docker-compose.production.yml exec backend \
  python manage.py check --deploy
```

Requires production env already loaded in the container (no secrets printed here).
