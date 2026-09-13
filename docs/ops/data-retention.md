# Data retention — Riva Bistro

## Public policy

`/integritetspolicy` states booking/contact personal data is retained up to
**30 days after the reservation date** (bookings) or receipt date (inquiries),
then removed.

## Automated cleanup

| Mechanism | Detail |
|-----------|--------|
| Command | `python manage.py purge_personal_data` (`--dry-run` supported) |
| Script | `scripts/purge-personal-data.sh` (Docker Compose on VPS) |
| Bookings | Personal fields anonymized (`name` / `email` / `phone` / `special_request`); date, time, party size, status, and ref kept |
| Contact + event inquiries | Entire rows deleted after 30 days from `created_at` |
| Idempotent | Safe to run daily; already-scrubbed bookings are skipped |
| Logs | Counts only — never names, emails, phones, or message bodies |

### Suggested cron (VPS)

```cron
15 3 * * * cd /opt/riva-bistro && ./scripts/purge-personal-data.sh >>/var/log/riva-privacy-purge.log 2>&1
```

## Manual controls

Admin can still delete bookings and inquiries immediately (including bulk delete).
