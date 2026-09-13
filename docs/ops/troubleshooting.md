# Troubleshooting guide — Riva Bistro

Practical **SYMPTOM → LIKELY CAUSE → CHECK → FIX → ESCALATION** for the current stack.  
Human production steps stay human — nothing here claims automated healing.

Related: [production-runbook.md](../deployment/production-runbook.md), [maintenance-plan.md](./maintenance-plan.md), [bug-triage.md](./bug-triage.md).

---

## Reservation unavailable / no bookable slots

| | |
|--|--|
| **Symptom** | `/boka` shows closed, empty slots, or booking disabled messaging |
| **Likely cause** | `production_ready=false`; day closed / special closure; outside hours; lead-time/horizon rules |
| **Check** | `GET /api/v1/hours/`; `GET /api/v1/reservations/availability/?date=YYYY-MM-DD` — distinguish `closed` (restaurant shut) vs `enabled` (online booking allowed). Admin → Inställningar / Öppettider / closures |
| **Fix** | Fix hours/closures if wrong. Only set `production_ready=true` after owner confirms capacity. Do not invent hours |
| **Escalation** | Majd/ops if API errors; owner for business decision to enable booking |

---

## Booking failure (guest submit errors)

| | |
|--|--|
| **Symptom** | Form error / 4xx / 503 on `POST /api/v1/reservations/` |
| **Likely cause** | Validation; slot full; `not_enabled` (503); throttle 429; API down |
| **Check** | Response JSON `code` / fields; API health; recent deploys; throttle if many retries |
| **Fix** | Correct guest input; wait if 429; if `not_enabled`, leave gated or enable only with owner OK; restore API if down |
| **Escalation** | S2 if production bookings enabled but consistently failing — [bug-triage.md](./bug-triage.md) |

---

## Notification failure (Telegram / staff email / guest mail)

| | |
|--|--|
| **Symptom** | Reservation saved but staff/guest not notified; admin flags false |
| **Likely cause** | Missing/wrong VPS env (`TELEGRAM_*`, Hostinger mail, SMTP); provider outage; best-effort send failed |
| **Check** | Admin booking flags; `grep` env **keys** only (mask values); `./scripts/verify-notifications.sh --send-test` or `check_notifications --send-test` |
| **Fix** | Correct `.env`, `up -d --force-recreate backend`; resend via admin **Skicka om notiser** or `resend_reservation_notifications --unsent` |
| **Escalation** | Ops for VPS secrets; do not invent “alerts delivered” without a successful test |

---

## Menu not updating on the public site

| | |
|--|--|
| **Symptom** | Admin/Django changes not visible on `/meny` |
| **Likely cause** | Next fetch revalidate TTL (catalog ~60s); product inactive; wrong category; CDN/cache; edited staging not prod |
| **Check** | `GET https://api.rivabistro.se/api/v1/menu/products/` vs admin; product `is_available`; wait revalidate or redeploy frontend if env wrong |
| **Fix** | Publish/activate product; confirm API origin in Hostinger env; hard-refresh after TTL |
| **Escalation** | Maintainer if API returns stale data despite DB change |

---

## Admin access problem

| | |
|--|--|
| **Symptom** | Cannot log in at `/admin` or 403 on admin APIs |
| **Likely cause** | Non-staff user; wrong password; cookie/CORS/`COOKIE_DOMAIN` mismatch across `rivabistro.se` / `api.rivabistro.se`; CSRF missing on writes |
| **Check** | User `is_staff` in Django Admin; browser cookie Secure/SameSite; API login response; CORS/CSRF hosts in VPS `.env` |
| **Fix** | Reset password via Django; ensure staff flag; fix cookie domain for production HTTPS; use the Next admin UI (sends CSRF) |
| **Escalation** | Ops for cookie/CORS env; never commit passwords |

---

## Media / image issue

| | |
|--|--|
| **Symptom** | Broken images on menu or gallery |
| **Likely cause** | Upload rejected (type/size); `MEDIA` not served; wrong `image_url`; Next `remotePatterns` / API host mismatch; `NEXT_PUBLIC_API_URL` wrong |
| **Check** | Upload error in admin; `curl -I https://api.rivabistro.se/media/...` (expect 200 + `Cache-Control`); media URL host; file magic-byte validation in logs |
| **Fix** | Re-upload valid JPG/PNG/WebP ≤5MB; ensure `MEDIA_SERVE=true` or nginx mounts `MEDIA_ROOT`; rebuild frontend with production `NEXT_PUBLIC_API_URL`; set `FRONTEND_REVALIDATE_*` if pages stay stale |
| **Escalation** | Ops if Nginx media mapping broken on VPS |

---

## Frontend unavailable

| | |
|--|--|
| **Symptom** | `rivabistro.se` down or old build |
| **Likely cause** | Hostinger app stopped; bad build; wrong env baked into build |
| **Check** | `curl -fsSI https://rivabistro.se`; Hostinger panel status; that `NEXT_PUBLIC_API_URL` is production HTTPS |
| **Fix** | Redeploy last good frontend commit; fix env and rebuild |
| **Escalation** | Hostinger support / Majd |

---

## API unavailable

| | |
|--|--|
| **Symptom** | `api.rivabistro.se` errors; site data missing |
| **Likely cause** | Container down; Postgres DNS (`host.docker.internal`); Nginx/TLS; deploy mid-restart |
| **Check** | `curl -fsS https://api.rivabistro.se/api/v1/health/`; `docker compose -f docker-compose.production.yml ps`; logs; `extra_hosts` mapping |
| **Fix** | Restart/recreate backend; restore `extra_hosts` if missing; wait for brief deploy interruption ([zero-downtime-limitation.md](../deployment/zero-downtime-limitation.md)) |
| **Escalation** | S1 if prolonged — ops on VPS |

---

## Deployment issue

| | |
|--|--|
| **Symptom** | Deploy fails or site unhealthy after release |
| **Likely cause** | Migration error; wrong compose file; missing env; build failure |
| **Check** | Compose logs; `git rev-parse HEAD`; confirm `docker-compose.production.yml` |
| **Fix** | Rollback to known-good SHA; restore DB if irreversible migration ([zero-downtime-limitation.md](../deployment/zero-downtime-limitation.md)) |
| **Escalation** | Maintainer + ops; open incident if guests affected |

---

## Database issue

| | |
|--|--|
| **Symptom** | Health reports DB failure; 500s on reads/writes |
| **Likely cause** | Postgres down; bad `DATABASE_URL`; disk full |
| **Check** | Health payload; Postgres service on host; container can resolve `host.docker.internal` |
| **Fix** | Restore Postgres service; fix URL only if actually wrong; restore from backup if data corrupted |
| **Escalation** | Ops immediately (S1) |

---

## Backup / restore issue

| | |
|--|--|
| **Symptom** | No recent dump; restore failed |
| **Likely cause** | Backup script not run; permissions; restore without confirmation guard |
| **Check** | Backup directory timestamps; script stderr; never run restore against prod without intent |
| **Fix** | Run `scripts/backup-postgres.sh`; restore only with `CONFIRM_RESTORE=YES` and a verified dump; prefer non-prod drill first |
| **Escalation** | Ops; do not claim a successful restore drill without recording it |

---

## Contact / event inquiry not received

| | |
|--|--|
| **Symptom** | Guest sent form; staff inbox empty |
| **Likely cause** | Message persisted but email failed; wrong `RESTAURANT_NOTIFICATION_EMAIL` |
| **Check** | Next admin **Förfrågningar** or Django Admin `ContactMessage` / `EventInquiry`; mailoutbox/env |
| **Fix** | Read inbox in admin; fix mail env and retest |
| **Escalation** | Ops for mail provider |

---

## Rate limited (429)

| | |
|--|--|
| **Symptom** | Login, booking, or contact returns 429 |
| **Likely cause** | Scoped throttles (auth / reservations / inquiries) or anon GET flood |
| **Check** | How many retries; shared NAT; throttle settings in `settings.py` |
| **Fix** | Wait for window; stop automated hammering; investigate abuse if sustained |
| **Escalation** | Security-minded review if attack suspected — no pentest theater required |
