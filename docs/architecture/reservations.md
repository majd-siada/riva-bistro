# Reservations Architecture

> Status: **designed in Phase 1**, implemented in **Phase 2**.

## Principles

1. The frontend availability UI is **advisory only**.
2. The backend performs a **final availability check** inside the create-reservation transaction.
3. Concurrent bookings are protected with database transactions and locking/constraints.
4. Every reservation receives a **unique booking reference**.
5. Telegram notification is **out of band** — never part of the commit path.

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

## Planned statuses

| Status      | Meaning                                      |
|-------------|----------------------------------------------|
| `pending`   | Created; awaiting staff confirmation (if required) |
| `confirmed` | Accepted                                     |
| `cancelled` | Cancelled by guest or restaurant             |
| `completed` | Guest attended                               |
| `no_show`   | Guest did not arrive                         |

## Availability inputs

- Regular / seasonal opening hours
- Special closures (override hours)
- Restaurant capacity
- Party size
- Existing non-cancelled reservations
- Configurable booking rules (lead time, slot length, max party size)

Business logic lives in a **service/domain layer**, not serializers or React components.

## Critical tests (Phase 2)

- Valid booking
- Invalid party size
- Closed date
- Outside opening hours
- Capacity exceeded
- Cancellation
- Duplicate booking-reference protection
- Concurrent booking protection
- Telegram failure does not fail reservation creation
