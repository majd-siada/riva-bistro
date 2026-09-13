# Maintenance plan — Riva Bistro

Based on the current architecture: Hostinger Next frontend + VPS Docker API + host PostgreSQL.  
Companion: [production-runbook.md](../deployment/production-runbook.md), [bug-triage.md](./bug-triage.md), [troubleshooting.md](./troubleshooting.md).

**Legend:** 🤖 = automated today · 👤 = human/manual · ⛔ = not automated (do not claim otherwise)

## Ownership

| Area | Owner (MVP) |
|------|-------------|
| VPS, Docker, Postgres, DNS changes, secrets | Majd / ops |
| Hostinger frontend builds & env | Majd / ops |
| Menu, hours, closures, bookings day-to-day | Restaurant staff (Next `/admin` + Django Admin as needed) |
| Legal copy approval | Owner / counsel |
| Code changes & dependency PRs | Maintainer |

## Cadence

### Weekly (👤)

- Skim API logs for repeated 5xx / notify failures:  
  `docker compose -f docker-compose.production.yml logs --tail=200 backend`
- Confirm `GET https://api.rivabistro.se/api/v1/health/` returns 200
- Spot-check `/meny`, `/boka`, admin login
- Review open GitHub issues (triage backlog)

### Monthly (👤)

- **Dependency updates:** review Dependabot/outdated (`npm outdated` in `frontend/`, pip/uv in backend); apply security patches first; run CI locally or via PR
- **Certificate / domain:** browser TLS padlock + `curl -fsSI https://rivabistro.se` and `https://api.rivabistro.se` (Let's Encrypt renewals are typically 🤖 via host certbot — **confirm**, do not invent success)
- **Public DNS spot-check:** redo commands in [dns-verification.md](../deployment/dns-verification.md)
- **Content:** staff confirm featured dishes, hours, closures for holidays
- **Backup presence:** verify a recent Postgres dump exists on the VPS backup path (script: `scripts/backup-postgres.sh` — schedule is 👤 unless cron was installed by ops)
- **Privacy purge:** confirm daily cron via `./scripts/install-privacy-purge-cron.sh` (or recent `/var/log/riva-privacy-purge.log`) — 👤 until cron is enabled on the VPS

### Quarterly (👤)

- **Restore verification drill:** restore a dump to a **non-production** target or documented dry-run; record date/outcome. Do **not** claim restore success without a real drill.
- **Security patch review:** Django/Next/OS updates; rotate any suspected leaked secrets
- **QA pass:** reservation gate still correct (`production_ready`), notifications config keys present (values secret), mobile smoke on a real device if available
- **Access review:** who has VPS, Hostinger, GitHub, Telegram bot admin

### As needed (👤)

- Deploy (manual) — see runbook + [zero-downtime-limitation.md](../deployment/zero-downtime-limitation.md)
- Incident response — runbook SEV + troubleshooting guide
- Re-seed menu sections only when intentional

## Task matrix

| Task | Mode | Notes |
|------|------|-------|
| CI lint/test/build on PR | 🤖 | `.github/workflows/ci.yml` — **no CD** |
| Production deploy | 👤 | VPS compose + Hostinger build |
| DB backup | 👤 (or 🤖 only if cron configured by ops) | `scripts/backup-postgres.sh` |
| DB restore | 👤 | `scripts/restore-postgres.sh` + `CONFIRM_RESTORE=YES` |
| Notification channel check | 👤 | `scripts/verify-notifications.sh` / `check_notifications` |
| Log review | 👤 | docker compose logs |
| Monitoring / alerting | ⛔ | No SIEM; health is curl/manual unless owner adds uptime later |
| Dependency updates | 👤 | PR + test; not auto-merge |
| Content (menu/hours/news/gallery) | 👤 | Next admin + Django Admin |
| Security patches (OS/Docker host) | 👤 | VPS maintainer |
| Certificate renewal | 🤖 typical / 👤 verify | Confirm on VPS; not claimed from this repo alone |

## Security patches

1. Prefer upstream security releases for Django, Next, Node, OpenSSL.
2. Patch on a branch → CI green → manual deploy.
3. After credential exposure: rotate `.env` secrets, recreate backend container, invalidate sessions as needed.

## Content maintenance

- Day-to-day: Next `/admin` (bokningar, meny, öppettider, inställningar).
- News/gallery/modifiers: Django Admin at `https://api.rivabistro.se/admin/` (staff).
- Do not flip `production_ready=true` without owner capacity confirmation.

## Periodic QA checklist (👤)

- [ ] Health 200  
- [ ] Menu categories load  
- [ ] Hours match official schedule intent  
- [ ] Availability semantics (`closed` vs `enabled`) understood  
- [ ] Contact form validation still works  
- [ ] Admin login + one booking status update  
- [ ] No localhost API URL in production frontend env  

## Explicit non-goals

- Automated CD, Redis, S3, SIEM, GA/GTM
- Claiming backups/restores/alerts succeeded without evidence
- True zero-downtime deploys (documented limitation)
