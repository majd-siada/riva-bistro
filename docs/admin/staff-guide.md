# Staff guide — Riva Bistro admin

## Sign in

Use the Next.js admin at `/admin` (session cookie against the API). Only Django staff users.

## Daily tasks

1. **Bokningar** — review today’s reservations; update status; check Telegram/email flags; use **Skicka om notiser** if a flag is false after a VPS env fix.
2. **Meny** — edit categories/products; upload images (JPG/PNG/WebP, max 5 MB).
3. **Öppettider** — weekly hours + special closures.
4. **Inställningar** — capacity, lead time, horizon. **Do not** set `production_ready=true` until real capacity is confirmed by the owner.

## Notifications

- Create-time staff alerts are best-effort.
- Resend: admin UI button or  
  `python manage.py resend_reservation_notifications --unsent`

## Safety

- Never commit `.env` secrets.
- Never enable online booking from a deploy script.
