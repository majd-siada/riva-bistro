# Repository-level security audit — Riva Bistro

**Date:** 2026-09-07  
**Scope:** Internal review of this repository’s implemented controls and automated tests.

> **This is an internal repository-level security review, not an independent penetration test.**

## AREA → IMPLEMENTATION → TEST/EVIDENCE → LIMITATION

| Area | Implementation | Test / evidence | Limitation |
|------|----------------|-----------------|------------|
| Authentication | Django session auth; staff-only admin login | `test_admin_auth.py`, CSRF-enforced admin write test | No SSO/MFA |
| Authorization | `IsAdminUser` on admin APIs; OpenAPI staff-only | `test_api_hardening.py`, `test_health.py` schema | Object-level ownership N/A (single-tenant restaurant) |
| Validation | DRF serializers on reservations/contact/menu | Reservation/contact validation tests | Not fuzz-tested |
| Throttling | AnonRateThrottle + scoped auth/reservations/inquiries | `test_throttle_behavior.py` (429) | **LocMemCache = per-process**, not shared across workers |
| Secrets / config | Env-based secrets; no secrets in repo | `.env.example` + checklist | Live secret rotation is operator duty |
| Error leakage | Stock DRF handler; DEBUG off in prod | Hardening tests assert no traceback in 400 bodies | DEBUG must stay false in prod |
| Security headers (Next) | nosniff, Referrer-Policy, X-Frame DENY, Permissions-Policy, CSP **Report-Only** | `security-headers.test.ts` + public curl notes | Live CDN may strip headers until Hostinger verify |
| Security headers (Django) | When `DEBUG=false`: Secure cookies, HSTS, nosniff, XFO, referrer, COOP | Settings source assertions + COOP/XFO tests | Applied only when DEBUG false at process start |
| Cookies | HttpOnly session; readable CSRF for SPA; SameSite Lax/None via env | Cookie flag tests | Cross-subdomain needs correct `COOKIE_DOMAIN` |
| CSRF | Required for session-authenticated admin writes; public booking clears auth | CSRF enforce test; public booking CSRF ignore test | SPA must send CSRF header (Next admin does) |
| CORS | Allowed origins from env | Settings / checklist | Misconfigured origins break admin |
| Uploads | Magic-byte sniff JPEG/PNG/WebP; 5 MB max | `test_media_uploads.py` | Not antivirus scanning |
| Admin protection | Staff gate + Next `/admin` session | Auth + hardening suites | Physical device / phishing out of scope |
| Database access | ORM only; host Postgres via compose | Health DB check | Host DB hardening is VPS/ops |
| Logging | Console structured logging; no token logging policy | Logging config test | No SIEM |
| Dependencies | CI lint/test/build; manual patch cadence | Maintenance plan | No automated CVE gate claimed |

## Explicit non-claims

- Not a penetration test or bug-bounty result
- Not host/firewall/OS hardening verification
- Not proof that Hostinger preserves frontend security headers
- Not shared/global throttle enforcement under multi-worker gunicorn

## Related

- [security.md](./security.md)
- [api-hardening.md](./api-hardening.md)
- [final-security-check.md](./final-security-check.md)
- [security-verification.md](./security-verification.md)
