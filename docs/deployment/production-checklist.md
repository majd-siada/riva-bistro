# Riva Bistro — Production Deployment Checklist

**Do not deploy from this document alone.** Complete every OWNER / HOSTINGER item first.  
This is the single cutover checklist for Step 3 (configuration). Deployment is a later step.

Architecture:

| Host | Role |
|------|------|
| `rivabistro.se` / `www.rivabistro.se` | Next.js frontend (Hostinger Node) |
| `api.rivabistro.se` | Django / DRF API + PostgreSQL (API host / VPS) |

---

## A. OWNER VALUES

Update only after the restaurant confirms real facts. **Do not invent values.**

### NAP / hours / social — [`frontend/src/config/business.ts`](../../frontend/src/config/business.ts)

While `verified: false` (current):

- Site may still **display** placeholder NAP/hours in UI.
- **Restaurant JSON-LD is not emitted** (`RestaurantJsonLd` returns `null`).

When the owner supplies confirmed values, update in this file:

1. `address.street`, `address.postalCode`, `address.city`
2. `phone`, `phoneHref`, `phoneE164`
3. `email`
4. `restaurantHoursLabel` (fallback label if API hours fail)
5. `kitchenHours` (or remove from UI if not used)
6. `mapUrl`
7. `social.instagram`, `social.facebook` (or clear if unused)
8. Set **`verified: true`** only after the above are confirmed

Also configure **opening hours / closures** in Admin → Öppettider (source of truth for booking + display via API).

### Booking capacity (Admin → Inställningar)

Before flipping live booking:

1. Set real `max_guests_per_slot`, lead time, horizon, buffers
2. Confirm hours + special closures
3. Only then set **`production_ready = true`**

With `DJANGO_DEBUG=false` and `production_ready=false`, reservation create returns **503** `not_enabled`. Do **not** enable until capacity is real.

### Admin account

- Strong `DJANGO_ADMIN_PASSWORD` (never commit)
- Optional: `python manage.py seed_admin` once on the API host after migrate

### Notification inbox

- `RESTAURANT_NOTIFICATION_EMAIL` — staff inbox for contact + private-event inquiries

---

## B. FRONTEND HOSTINGER VARIABLES

Set on the Hostinger Node app **before** `npm run build` (`NEXT_PUBLIC_*` are baked at build time):

```bash
NEXT_PUBLIC_SITE_URL=https://rivabistro.se
NEXT_PUBLIC_API_URL=https://api.rivabistro.se
INTERNAL_API_URL=https://api.rivabistro.se
```

Build / start (monorepo; Hostinger uses standalone output + postbuild sync):

```bash
# From frontend/ (or Hostinger build root that runs frontend package scripts)
npm ci
npm run build    # runs next build + Hostinger standalone sync (postbuild)
# Hostinger runs the standalone server (see scripts/hostinger-sync-next-output.mjs)
```

Do **not** set `NODE_ENV=development` in Hostinger env (breaks production build).

After changing any `NEXT_PUBLIC_*` value: **rebuild and redeploy** the frontend.

---

## C. BACKEND HOSTINGER / API HOST VARIABLES

```bash
DJANGO_DEBUG=false
DJANGO_SECRET_KEY=<OWNER/HOSTINGER SECRET — generate; never commit>
DJANGO_ALLOWED_HOSTS=api.rivabistro.se
DJANGO_CORS_ALLOWED_ORIGINS=https://rivabistro.se,https://www.rivabistro.se
DJANGO_CSRF_TRUSTED_ORIGINS=https://rivabistro.se,https://www.rivabistro.se,https://api.rivabistro.se
DJANGO_COOKIE_SAMESITE=None
DJANGO_COOKIE_DOMAIN=.rivabistro.se
DATABASE_URL=postgres://<user>:<password>@<host>:5432/<db>
MEDIA_ROOT=<persistent path on API host>
MEDIA_URL=/media/
MEDIA_SERVE=true
```

Process:

- Image default: **gunicorn** (`config.wsgi:application`, bind `0.0.0.0:8000`)
- Entrypoint runs `migrate` then `collectstatic` when not DEBUG
- Do **not** use `runserver` in production

TLS: terminate HTTPS in front of gunicorn; set `X-Forwarded-Proto: https` (Django uses `SECURE_PROXY_SSL_HEADER`).

With `DJANGO_DEBUG=false`, session and CSRF cookies are **`Secure=True`** automatically.

---

## D. DATABASE

PostgreSQL required. Provide production `DATABASE_URL` (HOSTINGER / OWNER).

Migrations in repo (apply in dependency order via `migrate`):

| App | Migration |
|-----|-----------|
| catalog | `0001_initial`, `0002_product_featured_order_product_image_and_more` |
| reservations | `0001_initial` |
| core | `0001_inquiries_news_gallery` |

No unexpected destructive migrations in tree. Always:

```bash
python manage.py migrate --noinput
```

Do not run migrate from this checklist until cutover.

---

## E. SMTP

When `DJANGO_DEBUG=false`, default backend is SMTP.

```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=<smtp host>
EMAIL_PORT=587
EMAIL_HOST_USER=<smtp user>
EMAIL_HOST_PASSWORD=<smtp password — never commit>
EMAIL_USE_TLS=true
DEFAULT_FROM_EMAIL=Riva Bistro <no-reply@rivabistro.se>
RESTAURANT_NOTIFICATION_EMAIL=<staff inbox>
```

| Flow | Needs SMTP + from | Needs `RESTAURANT_NOTIFICATION_EMAIL` | Persist if email fails |
|------|-------------------|----------------------------------------|-------------------------|
| Booking guest confirmation | Yes | No | Reservation still created; `email_sent` / flag may be false |
| Contact form → restaurant | Yes | Yes | Message still saved; `email_sent=false` |
| Private event → restaurant | Yes | Yes | Inquiry still saved; `email_sent=false` |

---

## F. MEDIA

| Asset | Where | Production |
|-------|--------|------------|
| Scene photos (`/scenes/*`) | Next.js `public/` | Served by frontend host |
| Menu uploads | Django `MEDIA_ROOT` (`/media/...`) | API host; browser uses `NEXT_PUBLIC_API_URL` + `/media/` |
| Gallery uploads | Same as menu if FileField used | Same |
| Gallery seed paths | `/scenes/...` via `image_url` | Frontend origin (idempotent `seed_gallery`) |
| Django admin static | WhiteNoise after `collectstatic` | API process |

`MEDIA_SERVE=true` (default): Django serves `/media/` when `DEBUG=false`.  
`MEDIA_SERVE=false`: nginx/CDN must mount `MEDIA_ROOT`.

**Hostinger / API host:** use a **persistent volume** for `MEDIA_ROOT` so uploads survive container restarts. No S3 required for launch.

---

## G. DNS

| Name | Type | Points to |
|------|------|-----------|
| `rivabistro.se` / `www` | (existing) | Frontend / Hostinger |
| `api` | **A** or **CNAME** | **HOSTINGER/API HOST VALUE REQUIRED** |

Do not invent the API host IP or hostname. Create the record only when the API host address is known. TLS certificate required for `api.rivabistro.se`.

---

## H. MIGRATIONS (post-deploy commands)

On the API host, after env is set:

```bash
python manage.py migrate --noinput
# Entrypoint may already run this; safe to re-run.
```

---

## I. SEEDS (optional, post-deploy)

All seeds below are safe / idempotent where noted. Run only if content is empty.

```bash
python manage.py seed_admin          # creates/updates admin from DJANGO_ADMIN_* env
python manage.py seed_reservations   # hours + settings; keeps production_ready=False
python manage.py seed_menu           # catalog if empty / as designed by command
python manage.py seed_gallery        # update_or_create by image_url — idempotent
```

`seed_gallery` only points at existing Next `/scenes/*` paths; it does not upload binaries.

---

## J. POST-DEPLOYMENT VERIFICATION

1. `curl https://api.rivabistro.se/api/v1/health/` → `status: ok`
2. `GET /api/v1/menu/categories/` and `/api/v1/hours/` → 200
3. Frontend home/meny/boka/galleri/kontakt → 200
4. `/robots.txt` and `/sitemap.xml` use `https://rivabistro.se` (no localhost)
5. Admin login on `https://rivabistro.se/admin/login` → API health OK; session cookie for `api` / `.rivabistro.se`
6. Contact/event: submit test → row in admin Förfrågningar; email only if SMTP configured
7. Booking: availability loads; create stays **disabled** until `production_ready=true`
8. Menu/gallery images under `/media/` load from API origin
9. View source: **no** Restaurant JSON-LD until `business.verified=true`

---

## Local development (not production)

```bash
cp .env.example .env
docker compose up --build
# Web http://localhost:3000  API http://localhost:8000
# Compose overrides backend to runserver; image default remains gunicorn.
```

See root [`.env.example`](../../.env.example) for local defaults vs the production block above.


See also: [production-runbook.md](./production-runbook.md) for deploy / rollback / verification commands.
