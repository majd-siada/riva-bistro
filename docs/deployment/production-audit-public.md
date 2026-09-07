# Public production audit (#256)

**Date (UTC):** 2026-09-07  
**Method:** `scripts/production-check.sh` + public `curl -sI` header probes  
**No** admin login, VPS shell, secrets, or notification sends.

## Verified publicly (this run)

| Check | Result |
|-------|--------|
| TLS cert readable `api.rivabistro.se` | OK |
| TLS cert readable `rivabistro.se` | OK |
| `GET https://rivabistro.se/` | **200** |
| `GET /api/v1/health/` status ok | OK |
| Health reports database ok | OK |
| Menu products/categories/featured | **200** |
| Hours + official schedule match | OK (7 open weekdays) |
| Reservation availability (+2 days) | **200** |
| production-check.sh summary | **Passed: 11  Failed: 0** |

Log: `/opt/cursor/artifacts/phase3-production-audit.log` (local agent artifact).

## Public security headers observed

### Frontend `https://rivabistro.se/`

```
HTTP/2 200
content-type: text/html; charset=utf-8
content-security-policy: upgrade-insecure-requests
```

**Note:** Next.js-configured headers (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, CSP-Report-Only) were **not** present in this live response. Likely Hostinger/CDN pass-through gap — **live host verification**, not proof that `next.config.ts` lacks the headers (local config tests still pass).

### API `https://api.rivabistro.se/api/v1/health/`

```
HTTP/1.1 200 OK
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: same-origin
```

## Remains external

- Authenticated admin checks
- VPS/docker/host config
- Notification delivery
- Secret/env review
- Confirming Hostinger preserves Next security headers after deploy/config

## Re-run

```bash
./scripts/production-check.sh
curl -sI https://rivabistro.se/ | tr -d '\r' | grep -iE '^(HTTP/|x-content-type|referrer-policy|x-frame|permissions-policy|content-security-policy)'
curl -sI https://api.rivabistro.se/api/v1/health/ | tr -d '\r' | grep -iE '^(HTTP/|strict-transport|x-content-type|x-frame|referrer)'
```
