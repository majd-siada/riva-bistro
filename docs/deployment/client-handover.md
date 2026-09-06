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

1. **Reservations:** Admin → Bokningar (or Django admin).
2. **Menu:** Admin → Meny. Public site reads the same CMS.
3. **Hours / closures:** Admin → Öppettider.
4. **Enable online booking:** only after capacity is real → set `production_ready=true`.
5. **Missed staff alerts:**  
   `python manage.py resend_reservation_notifications --unsent`

## Before calling the site “fully live”

- [ ] Confirm social URLs / kitchen hours → set `verified: true` in `frontend/src/config/business.ts` and redeploy frontend (enables social `sameAs` in JSON-LD).
- [ ] Recreate backend after any `.env` change:  
  `docker compose -f docker-compose.production.yml up -d --force-recreate backend`
- [ ] `./scripts/verify-notifications.sh --send-test` → Telegram OK + staff email OK
- [ ] Place a test booking on `/boka`
- [ ] Have counsel review `/integritetspolicy`, `/cookies`, `/villkor`, `/bokningspolicy`
- [ ] Schedule DB backups: `./scripts/backup-postgres.sh` (cron daily)
- [ ] Optional: set `SENTRY_DSN` after installing `sentry-sdk`

## Support posture

- Application code: this repository + CI
- DNS/SSL/hosting passwords: owner-controlled; never commit to git
- Do not invent menu prices, awards, or reviews in copy

See also: `docs/PROJECT-COMPLETION-MATRIX.md` for the full 325-item readiness status.
