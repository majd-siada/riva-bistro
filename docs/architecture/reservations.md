# Reservations Architecture

> Status: **implemented** in the `reservations` Django app.

## Model: instant confirmation, backend-enforced

Bookings are confirmed instantly, but availability is decided entirely by the
backend — the frontend availability UI is advisory only. Implementation:
`apps/backend/reservations/` (`availability.py`, `booking.py`).

## Principles

1. The frontend availability UI is **advisory only**; the backend re-checks on create.
2. Concurrency: a Postgres **transaction-scoped advisory lock** keyed on the slot
   (`pg_advisory_xact_lock`) serialises concurrent bookings for the same date+time,
   so capacity is enforced at the database layer (no overbooking).
3. Every reservation receives a **unique booking reference** (`RB-XXXXXX`).
4. **Production guard**: instant online booking is allowed **only** when
   `ReservationSettings.production_ready` is true. `settings.DEBUG` must **never**
   bypass this gate (a mis-set `DEBUG` on a production host must not enable bookings).
   When disabled, availability returns `enabled=false` with a clear response — not a
   fake confirmation — until staff set capacity and turn online booking on.
5. Confirmation email is **best-effort** and out of band — a mail failure never
   turns a real, committed booking into an error.

## Conceptual flow

```
Customer → Next.js → POST /api/v1/reservations
  → validation
  → FINAL availability check (opening hours, closures, capacity, party size, existing bookings)
  → DB transaction + lock
  → reservation row + booking reference
  → enqueue Telegram notification job
  → response with booking reference
```

## Statuses

| Status      | Meaning                          |
|-------------|----------------------------------|
| `confirmed` | Accepted (default on create)     |
| `seated`    | Guest has arrived                |
| `cancelled` | Cancelled by guest or restaurant |
| `no_show`   | Guest did not arrive             |

Staff manage status from the admin (`/admin/bokningar`).

## Availability inputs

- Regular / seasonal opening hours (`OpeningHours`, weekday Monday=0 … Sunday=6)
- Special closures (override hours)
- Restaurant capacity
- Party size
- Existing non-cancelled reservations
- Configurable booking rules (lead time, slot length, max party size)

Availability response fields (keep distinct):

| Field | Meaning |
|-------|---------|
| `closed` | Restaurant not open that calendar day (hours / closure / out of horizon) |
| `enabled` | Online booking allowed (`production_ready` only; `DEBUG` never enables booking) |

`production_ready=false` must yield `enabled=false` without forcing `closed=true`
on an open day.

Business logic lives in a **service/domain layer**, not serializers or React components.

## Tests

Covered in `apps/backend/reservations/tests/`:

- Valid booking
- Invalid party size
- Invalid / misaligned slot
- Closed date (special closure) and past dates
- Capacity exceeded (full slot rejected)
- Duplicate-submission idempotency
- Production guard (disabled vs. enabled)
- Public booking works even with an authenticated session (no CSRF for guests)
