# Riva Bistro — Client handover guide

Short operational guide for the restaurant owner (Majd). Technical deploy details live in `production-checklist.md` and `production-runbook.md`.

## What you own

| Asset | Where |
|-------|--------|
| Domain `rivabistro.se` | Registrar / Hostinger DNS |
| Website frontend | Hostinger Node |
| API + database | VPS (`api.rivabistro.se`) |
| Admin login | Django staff user (seeded once; change password) |
| Telegram bot | BotFather token + chat id in VPS `.env` |
| Staff email | Hostinger Mail API and/or SMTP in VPS `.env` |
| Google Business Profile | Google account (external) |
| Search Console | Google account (external) |

## Daily operations

1. **Reservations:** Admin → Bokningar (Notiser column + resend in detail; multi-select delete when needed). Online booking is controlled only by Inställningar → onlinebokning (`production_ready`). `DJANGO_DEBUG` never bypasses this gate.
2. **Menu:** Admin → Meny (six section tabs). Public `/meny` reads Django catalog only — never silent static dishes. Dish photos upload to the API (`/media/menu/`) and appear on `/meny` after save (on-demand revalidation when `FRONTEND_REVALIDATE_*` is set).
3. **Hours / closures:** Admin → Öppettider (also feeds Restaurant JSON-LD).
4. **Gallery / inquiries:** Admin → Galleri (photos on API `/media/gallery/` → `/galleri` + homepage strip) and Förfrågningar (contact + event messages; multi-select delete). Homepage/news/offers CMS screens were removed on purpose — do not look for Startsida, Nyheter, Erbjudanden, or Restaurang in the nav.
5. **Toggle online booking:** Inställningar → Aktivera onlinebokning. Keep `DJANGO_DEBUG=false` on the API. Booking was live-verified in the 2026-09-09 audit; do not turn off without an owner decision.
6. **Missed staff alerts:** open booking → Skicka om notiser, or  
   `python manage.py resend_reservation_notifications --unsent`

## Admin navigation (current)

Översikt · Bokningar · Förfrågningar · Meny · Galleri · Öppettider · Inställningar

## Before calling the site “fully live”

- [ ] Confirm social URLs / kitchen hours → set profile/`business.verified` true and redeploy (enables social `sameAs` in JSON-LD).
- [ ] Recreate backend after any `.env` change:  
  `docker compose -f docker-compose.production.yml up -d --force-recreate backend`
- [ ] Re-confirm VPS: `DJANGO_DEBUG=false`, cookie domain, CORS/CSRF, notify credentials
- [ ] Optional: cancel audit probe reservation if still present
- [ ] Have counsel review `/integritetspolicy`, `/cookies`, `/villkor`, `/bokningspolicy`
- [ ] Schedule DB backups: `./scripts/backup-postgres.sh` (cron daily)
- [ ] Schedule privacy purge: `./scripts/install-privacy-purge-cron.sh` (daily — see `docs/ops/data-retention.md`)
- [ ] Optional: set `SENTRY_DSN` after installing `sentry-sdk`
- [ ] Google Business Profile + Search Console (external — not done from this repo)

## Support posture

- Application code: this repository + CI
- DNS/SSL/hosting passwords: owner-controlled; never commit to git
- Do not invent menu prices, awards, or reviews in copy

See also: `docs/PROJECT-COMPLETION-MATRIX.md` for the full 325-item readiness status.
