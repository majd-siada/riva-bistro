# Security verification — headers & TLS posture

Separates **local configuration** from **live CDN/host verification**.

## LOCAL CONFIGURATION (proven in repo)

### Next.js (`frontend/next.config.ts` `headers()`)

| Header | Value (intent) |
|--------|----------------|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `DENY` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` |
| `Content-Security-Policy-Report-Only` | Restrictive policy; **report-only** (not enforced) |

Deterministic test: `frontend/src/lib/security-headers.test.ts` (source/config assertions).

CSP is intentionally **Report-Only**. Do not flip to enforcement without a product decision.

### Django (when `DEBUG=false`)

| Setting | Intent |
|---------|--------|
| `SESSION_COOKIE_SECURE` / `CSRF_COOKIE_SECURE` | HTTPS-only cookies |
| `SECURE_CONTENT_TYPE_NOSNIFF` | nosniff |
| `X_FRAME_OPTIONS` | `DENY` |
| `SECURE_HSTS_SECONDS` | HSTS (default 1y) + includeSubDomains |
| `SECURE_REFERRER_POLICY` | `same-origin` |
| `SECURE_CROSS_ORIGIN_OPENER_POLICY` | `same-origin` |
| `SECURE_PROXY_SSL_HEADER` | Trust `X-Forwarded-Proto` behind Nginx |

`SECURE_SSL_REDIRECT` is **not** enabled (TLS terminates at Nginx; avoids redirect loops).

Tests: `apps/backend/core/tests/test_security_settings.py`.

## LIVE CDN / HOST VERIFICATION (external / public probes)

Public probes do **not** require VPS login. Results may change after Hostinger/CDN deploys.

Recorded probe commands:

```bash
curl -sI https://rivabistro.se/ | tr -d '\r' | grep -iE '^(HTTP/|x-content-type-options|referrer-policy|x-frame-options|permissions-policy|content-security-policy)'
curl -sI https://api.rivabistro.se/api/v1/health/ | tr -d '\r' | grep -iE '^(HTTP/|strict-transport|x-content-type|x-frame|referrer)'
```

See `docs/deployment/production-audit-public.md` for the latest recorded public audit run (HTTPS, health, menu, headers observed).

**Limitation:** If frontend headers are missing live, Hostinger/CDN may be stripping Next `headers()` until redeploy/config — that is **live host verification**, not a local config failure.
