# Data retention (owner decisions required)

This document is a **fill-in template**. Do not treat placeholder periods as policy.

## Systems that store personal data

| Data | Where | Suggested review question for owner |
|------|-------|-------------------------------------|
| Reservation guest name/phone/email | Postgres `reservations_reservation` | How long after the booking date should rows be kept? |
| Contact / event inquiries | Postgres inquiry tables | How long should inbox messages be kept? |
| Staff auth accounts | Django auth | Who may retain admin accounts? |
| Media uploads | `MEDIA_ROOT` / object storage | When may unused images be deleted? |
| Application logs | Docker/journald | Max log retention on the VPS? |
| Backups | `scripts/backup-postgres.sh` output | How many daily dumps to keep? |

## Technical controls already present

- Online booking create stores only fields required for the reservation.
- Staff Telegram/email alerts are best-effort and do not invent third-party analytics IDs.
- Legal scaffolding pages state that final retention must be approved by owner/counsel.

## Owner actions

1. Fill retention periods with counsel.
2. Reflect approved periods in `/integritetspolicy`.
3. Schedule purge/archive jobs only after periods are decided (not automated in this repo yet).
