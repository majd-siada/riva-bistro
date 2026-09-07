# Reservation edge-case inventory (#168)

Deterministic backend coverage for booking correctness.  
**Not** production race/load testing.

| EDGE CASE | TEST | RESULT |
|-----------|------|--------|
| Open day returns slots | `test_availability_open_day_returns_slots` | Covered |
| Special closure → closed | `test_availability_closed_on_special_closure` | Covered |
| Past date availability closed | `test_availability_past_date_is_closed` | Covered |
| Create success path | `test_create_reservation_success` | Covered |
| Capacity / slot full (`code=full`) | `test_capacity_is_enforced` | Covered |
| Party size over max | `test_party_size_limit` | Covered |
| Party size at max accepted | `test_create_at_max_party_size_accepted` | Covered |
| Invalid slot time | `test_invalid_slot_rejected` | Covered |
| Duplicate submit idempotent | `test_duplicate_submission_is_idempotent` | Covered |
| `production_ready=false` blocks create | `test_production_guard_blocks_when_not_ready` / `test_production_guard_leaves_no_row` | Covered |
| `production_ready=true` allows create | `test_production_guard_allows_when_ready` | Covered |
| Open day + not ready ≠ restaurant `closed` | `test_open_day_production_ready_false_is_not_restaurant_closed` | Covered |
| Genuine closed weekday `closed=true` | `test_genuine_closed_weekday_reports_closed_true` | Covered |
| Placeholder hours → closed not merely disabled | `test_placeholder_hours_report_closed_not_merely_disabled` | Covered |
| Weekday closed create rejected | `test_weekday_closed_availability_and_create` | Covered |
| Special closure create rejected | `test_create_on_special_closure_rejected` | Covered |
| Past date create rejected | `test_create_past_date_rejected` | Covered |
| Booking horizon far future | `test_booking_horizon_rejects_far_future` | Covered |
| Malformed / missing availability date | `test_availability_requires_date` / `test_availability_rejects_malformed_date` | Covered |
| Missing fields / invalid email / short phone | `test_create_missing_fields_*` / `test_create_invalid_email_*` / `test_create_short_phone_*` | Covered |
| Public booking ignores CSRF with session | `test_public_booking_ignores_csrf_even_with_authenticated_session` | Covered |
| Hours API seven days / official schedule | `test_hours_endpoint_*` | Covered |
| Availability aligns with hours API | `test_availability_reads_same_opening_hours_as_hours_api` | Covered |
| Timezone weekday shift guard | `test_date_query_not_timezone_shifted_to_wrong_weekday` | Covered |
| Overnight Friday / Sunday official hours | `test_friday_midnight_*` / `test_sunday_*` / `test_official_hours_*` | Covered |
| Seed preserves hours / `production_ready` / closed intent | `test_seed_*` | Covered |

## Thin gaps reviewed

| Candidate | Decision |
|-----------|----------|
| Concurrent double-book race under load | **Out of scope** (would need load/chaos; not added) |
| Malformed reservation JSON body | Covered indirectly via missing/invalid field tests; no separate chaos harness |
| Admin authorization on reservation PATCH | Covered under API hardening admin authz (list); detail write covered by staff gate pattern |

## Conclusion

Deterministic booking edge coverage in `reservations/tests/test_reservations.py` satisfies the checklist requirement for **edge case testing of the reservation domain**. Live production race testing remains external and is not claimed.

Re-run:

```bash
cd apps/backend && .venv/bin/pytest reservations/tests/test_reservations.py -q
```
