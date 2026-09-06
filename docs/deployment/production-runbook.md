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

Host PostgreSQL is reached via `DATABASE_URL` using hostname `host.docker.internal`.
`docker-compose.production.yml` **must** keep this under `backend:` so DNS resolves
inside the container (Postgres listens on the Docker bridge gateway on the VPS):

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

Without that mapping, migrate/seed/gunicorn fail with
`psycopg.OperationalError: failed to resolve host 'host.docker.internal'`.
Do not change `DATABASE_URL`, Postgres credentials, or Postgres config to “fix”
a missing `extra_hosts` entry — restore the compose mapping instead.

Verify after edit / before deploy:

```bash
docker compose -f docker-compose.production.yml config | grep -A2 extra_hosts
# expect: host.docker.internal:host-gateway
```

---

## Build / deploy (API host)

From the repo root on the VPS:

```bash
git pull --ff-only
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d
```

The image entrypoint:

1. Waits for PostgreSQL (`DATABASE_URL` preferred; host via `host.docker.internal`)
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
docker compose -f docker-compose.production.yml exec backend python manage.py migrate --noinput
docker compose -f docker-compose.production.yml exec backend python manage.py seed_menu_sections
# Optional full dish seed (idempotent; prefer seed_menu_sections alone for hierarchy):
# docker compose -f docker-compose.production.yml exec backend python manage.py seed_menu
```

After `seed_menu_sections`, `GET /api/v1/menu/categories/` should include
`dagens-lunch`, `rivas-meny`, `take-away`, `stora-sallskapsmeny`, `snacks-drinkar`,
`dryck`, plus course categories with `parent_slug: "rivas-meny"`.

Public `/meny` **Kategorier** chips use these top-level Categories (`parent`
empty). Rename or reorder in Django Admin **CATALOG → Categories** (`name`,
`sort_order`, `is_active`); the seed never overwrites admin names/order after
create.

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

- `GET /api/v1/hours/` → weekdays with owner-confirmed opens/closes (not all-null stubs)
- `GET /api/v1/reservations/availability/?date=...` on an **open** day →
  `closed: false`, `enabled: false`, slots listed from OpeningHours
  (`closed` = restaurant shut; `enabled` = online booking allowed — keep distinct)
- `GET .../availability/` on a **closed** day → `closed: true`, `enabled: false`, `slots: []`
- `POST /api/v1/reservations/` → **503** with `code: not_enabled` when not production-ready (with `DJANGO_DEBUG=false`)

### Staff notifications (Telegram + email)

After a reservation row is **committed**, the API best-effort sends:

1. Telegram message to `TELEGRAM_CHAT_ID` via `@RivaB_bot` (`TELEGRAM_BOT_TOKEN`)
2. Staff email to `RESTAURANT_NOTIFICATION_EMAIL` (Hostinger Mail API if configured; on API failure falls back to Django SMTP)
3. Guest confirmation to the booker’s email (Django SMTP when `EMAIL_HOST` is set; otherwise Hostinger Mail API when configured)

Failures never roll back the booking. Flags `telegram_notified` / `staff_email_notified` avoid duplicate alerts on idempotent retries.

Configure on the VPS `.env` (never commit real secrets):

```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
HOSTINGER_MAIL_API_TOKEN=
HOSTINGER_MAIL_MAILBOX_RESOURCE_ID=
RESTAURANT_NOTIFICATION_EMAIL=
EMAIL_HOST=                  # optional if Hostinger is set
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=true
DEFAULT_FROM_EMAIL=
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
```

After editing the host `.env`, recreate the backend so env is reloaded, then verify:

```bash
docker compose -f docker-compose.production.yml up -d --force-recreate backend
./scripts/verify-notifications.sh --send-test
# or:
docker compose -f docker-compose.production.yml exec backend \
  python manage.py check_notifications --send-test
```

Discover chat id after messaging the bot:

```bash
docker compose -f docker-compose.production.yml exec backend \
  python manage.py telegram_discover_chat
```

If `/api/v1/hours/` still returns seven `is_closed: true` / null opens/closes rows,
OpeningHours were **not** applied to the API database — availability will correctly
report `closed: true` for every day until `seed_reservations` succeeds against that DB.
The public website may still show official hours via a frontend fallback; trust the API.

### Seed safety (do not overwrite owner hours)

When Production has seven uninitialized placeholder rows
(`is_closed=true`, `opens_at=null`, `closes_at=null` for every weekday),
run this **once** to apply the official schedule. No `--force-hours` needed:

```bash
docker compose -f docker-compose.production.yml exec backend \
  python manage.py seed_reservations
```

Behaviour:

- **All seven placeholders** → update to official hours (Mon–Thu 10:30–21:00,
  Fri 11:30–00:00, Sat 10:30–23:00, Sun 10:30–21:00)
- **Missing weekdays** → create official hours for those days only
- **Configured times** → preserved
- **Intentional closed day** (closed/null next to real hours) → preserved
- **`production_ready`** → never changed

Overwrite everything only with explicit owner approval:

```bash
# DANGEROUS after custom Admin edits — do not use on production casually
# docker compose -f docker-compose.production.yml exec backend \
#   python manage.py seed_reservations --force-hours
```

Verify afterward (Sunday must show 10:30–21:00, not null/closed):

```bash
curl -fsS https://api.rivabistro.se/api/v1/hours/
curl -fsS "https://api.rivabistro.se/api/v1/reservations/availability/?date=2026-09-06&party_size=2"
# Expect: closed=false, enabled=false, slots from 10:30… while production_ready is false
```

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
