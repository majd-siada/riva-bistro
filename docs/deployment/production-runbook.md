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
Owner-confirmed weekly hours (Google Business listing for Hornsbergs Strand 57)
are seeded by `python manage.py seed_reservations` and always leave
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

Expected while `production_ready=false` (even with real hours seeded):

- `GET /api/v1/hours/` → weekdays with owner-confirmed opens/closes
- `GET /api/v1/reservations/availability/?date=...` → `enabled: false` (and slots only once ready)
- `POST /api/v1/reservations/` → **503** with `code: not_enabled` when not production-ready (with `DJANGO_DEBUG=false`)

**Human / business steps before enabling bookings:**

1. Confirm hours + special closures in Admin → Öppettider (seed already loads the Google listing week)
2. Confirm capacity / lead time / horizon in Admin → Inställningar
3. Only then set **`production_ready = true`**

Do not enable bookings from deploy scripts.

---

## Django deploy checks (optional, on VPS)

```bash
docker compose -f docker-compose.production.yml exec backend \
  python manage.py check --deploy
```

Requires production env already loaded in the container (no secrets printed here).
