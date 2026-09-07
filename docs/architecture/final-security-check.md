# Final security check (deterministic, local)

Consolidates repository security evidence. **Not a penetration test.**

## PROVEN LOCALLY

| Control | Evidence |
|---------|----------|
| Staff auth / non-staff denial | `test_admin_auth.py` |
| Admin API authz matrix | `test_api_hardening.py` |
| Public method restrictions (POST→405) | `test_api_hardening.py` |
| Unpublished news not public | `test_api_hardening.py` |
| Safe validation errors (no traceback) | hardening + security settings tests |
| Throttle 429 (auth/reservations/inquiries) | `test_throttle_behavior.py` |
| Upload magic-byte / size reject | `test_media_uploads.py` |
| OpenAPI schema staff-only | `test_security_settings.py` / `test_health.py` |
| Cookie HttpOnly / CSRF readable SPA | `test_security_settings.py` |
| Production security flags in settings source | `test_security_settings.py` |
| Next security header config present | `security-headers.test.ts` |
| CSRF required for session admin writes | `test_security_settings.py` |
| Repo security audit map | `docs/architecture/security-audit.md` |

Run:

```bash
cd apps/backend && .venv/bin/pytest core/tests/test_security_settings.py core/tests/test_api_hardening.py core/tests/test_throttle_behavior.py core/tests/test_admin_auth.py core/tests/test_media_uploads.py -q
cd frontend && npm test -- src/lib/security-headers.test.ts
```

## REQUIRES EXTERNAL VERIFICATION

| Item | Why |
|------|-----|
| Independent penetration test | Optional; not performed |
| Hostinger/CDN preserves Next headers | Live `curl -sI` / panel |
| VPS firewall / OS hardening | Ops access |
| Production secret rotation / `.env` review | Out-of-band |
| Multi-worker shared throttle counters | Would need shared cache (not in MVP) |
| Alerting / SIEM | Not configured |

## Explicit statement

External pentest remains **optional** and is **not** represented as completed by this checklist.
