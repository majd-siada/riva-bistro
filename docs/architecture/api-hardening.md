# API hardening notes (MVP)

Evidence for checklist **#227**. This is **not** a penetration test and does not claim “complete” API security forever.

## Already in place

- Session authentication for admin APIs; public writes use empty `authentication_classes` (no CSRF requirement on anonymous booking/contact)
- `IsAdminUser` on admin menu/reservations/hours/settings/news/gallery/inquiries routes
- Scoped throttles: `auth`, `reservations`, `inquiries`, plus default `anon`
- Upload validation (type/size/magic) for product/gallery images
- OpenAPI schema views staff-only
- Security headers on the Next frontend; Django production security settings when `DEBUG=false`

## Added / verified in Phase 2 tests

Behavioral coverage in `core/tests/test_api_hardening.py` (+ inquiries throttle in `test_throttle_behavior.py`):

- Unauthenticated access denied on representative admin read/write surfaces
- Non-staff session cannot access admin APIs
- Public GET-only resources reject POST with **405**
- Unpublished news excluded from public list
- Predictable validation **400** bodies without stack traces
- Inquiries scoped throttle returns **429** under lowered test rates

## Remaining (acceptable MVP residual)

- LocMem throttle counters are per-process (multi-worker would need shared cache later — not Redis in this batch)
- No formal pentest / fuzz suite
- CSRF negative tests for admin cookie writes are environment-sensitive; Next admin sends CSRF in normal use
