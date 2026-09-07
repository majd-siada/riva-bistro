# Deployment model & zero-downtime limitation

**Status:** Accepted MVP limitation — **true zero-downtime deployment (ZDD) is not implemented.**

This document completes the operational requirement to document how deploys work today, what interruption risk exists, and how to roll back. It does **not** claim rolling deploys, blue/green, or zero-downtime cutovers.

## Current deployment model (manual)

| Surface | Host | Process |
|---------|------|---------|
| Frontend `rivabistro.se` | Hostinger Node | Manual `npm ci && npm run build` (or Hostinger build) → restart/serve standalone output |
| API `api.rivabistro.se` | Ubuntu VPS | Manual `git pull` → `docker compose -f docker-compose.production.yml build` → `up -d` |

- CI (GitHub Actions) runs lint/test/build; **there is no automated CD**.
- Use **`docker-compose.production.yml` only** on the VPS (never the local `docker-compose.yml`).
- Details: [production-runbook.md](./production-runbook.md).

## Expected short interruption risk

| Event | Risk |
|-------|------|
| API container recreate (`up -d --build`) | Brief API unavailability while the new container starts (migrate + gunicorn boot). Typically seconds to a couple of minutes. |
| Irreversible migration failure | Longer outage until rollback/restore. |
| Hostinger frontend rebuild/restart | Brief site unavailability or stale build during cutover. |
| Concurrent booking during API restart | Clients may see timeouts/5xx; retry after healthy. |

**Do not** market or checklist-claim “zero-downtime” for this stack.

## Identify the previous deploy

On the VPS:

```bash
cd /path/to/repo   # existing deploy path
git log --oneline -n 15
git rev-parse HEAD
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml images
```

Record the **git SHA** that was live before deploy (runbook practice: note SHA in the deploy log / chat). Frontend: note the Hostinger deploy timestamp / commit used for that build.

## Backup before risky deploys

Before migrations or releases that touch schema/data:

```bash
./scripts/backup-postgres.sh
# confirm artifact path/timestamp on the VPS backup location
```

Restore is **manual** and guarded (`CONFIRM_RESTORE=YES`) via `./scripts/restore-postgres.sh`. See runbook DR section.

## Rollback steps (API)

1. Confirm previous good SHA (from deploy notes or `git log`).
2. If a migration may be irreversible: **restore Postgres dump first**, then continue.
3. Check out the known-good SHA and rebuild:

```bash
git checkout <known-good-sha>
docker compose -f docker-compose.production.yml up -d --build
docker compose -f docker-compose.production.yml logs --tail=100 backend
curl -fsS https://api.rivabistro.se/api/v1/health/
```

4. Re-verify reservations gate (`production_ready`), hours, and a menu GET.

## Rollback steps (frontend)

1. Redeploy the previous known-good commit on Hostinger (`npm ci && npm run build` from that SHA, or Hostinger’s prior successful build if retained).
2. Confirm env still points at production HTTPS API URLs (no localhost).
3. Smoke: `/`, `/meny`, `/boka`, admin login path.

## What true ZDD would require later (not in MVP)

- Rolling or blue/green container updates with a load balancer / two healthy backends
- Expand/contract-compatible migrations (no blocking locks; expand → deploy → contract)
- Shared session/cache strategy if multi-instance (today LocMem throttles are single-process)
- Automated health-gated traffic shift
- Frontend atomic swap with health checks

Until then, treat short manual-deploy interruption as **accepted** and practice backup + SHA-noted rollback.

## Related

- [production-runbook.md](./production-runbook.md) — deploy, health, notifications, incident SEV
- [production-checklist.md](./production-checklist.md) — cutover checklist
- [../ops/troubleshooting.md](../ops/troubleshooting.md) — symptom → fix
