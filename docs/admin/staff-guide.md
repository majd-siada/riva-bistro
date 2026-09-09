# Staff guide — Riva Bistro admin

Practical guide for restaurant staff. Describes **what exists today** — not planned features.

## Where to work

| Tool | URL | Use for |
|------|-----|---------|
| **Next admin (preferred day-to-day)** | `https://rivabistro.se/admin` | Login, overview, bookings, inquiries inbox, menu, hours/closures, reservation settings |
| **Django Admin** | `https://api.rivabistro.se/admin/` | News, gallery, modifiers, low-level model edits, contact/event rows (readonly), user staff flags |

Only **Django staff** users can sign in. Ask Majd/ops to create accounts — do not share one password across the team long-term.

## Sign in (Next admin)

1. Open `/admin/login`.
2. Enter staff username/password (session cookie against the API).
3. If login fails: wrong password, user not staff, or cookie/domain issue → escalate to ops (see [troubleshooting.md](../ops/troubleshooting.md)).

Sign out with the control in the admin shell when done on a shared computer.

## What you can do in Next admin

### Overview (`/admin`)

- Today’s booking snapshot and simple KPIs (as implemented on the overview page).
- Start of day: confirm anything unexpected (large parties, pending statuses).

### Bokningar (`/admin/bokningar`)

- List and filter reservations.
- Update booking **status** (e.g. confirmed / cancelled — use the statuses shown in the UI).
- Check notification flags (Telegram / staff email).
- **Skicka om notiser** when a booking exists but flags show notify failed (after ops fixes env if needed).

### Förfrågningar (`/admin/forfragningar`)

- **Read-only** inbox for contact messages and event inquiries.
- Reply to guests via your normal mailbox; this screen does not send replies.

### Meny (`/admin/meny`)

Tabs match the six public sections on `/meny` (same Swedish labels):

| Admin tab | Public URL |
|-----------|------------|
| Dagens lunch | `/meny#dagens-lunch` |
| RIVAS MENY | `/meny#rivas-meny` (courses: Förrätter…Desserter) |
| TAKE AWAY | `/meny#take-away` |
| STORA SÄLLSKAPSMENY | `/meny#stora-sallskapsmeny` |
| SNACKS & DRINKAR | `/meny#snacks-drinkar` |
| DRYCK | `/meny#dryck` |

- Create/edit **products** under the active tab (name, price, description, availability, featured, sort order, images).
- Edit the **section** name / description / sort / active flag. Inactive sections disappear from the public Kategorier bar.
- **Dagens lunch:** set the week in the section **Namn** field (e.g. `Dagens lunch v.36`).
- **RIVAS MENY:** dishes live under course categories (Förrätter…Desserter); you can add course categories here.
- Upload images: JPG/PNG/WebP, max **5 MB**. Invalid files are rejected.
- Tip: hide a dish with availability off rather than deleting if it returns seasonally.
- Deep link `/admin/lunch` opens the same Dagens lunch editor (not a separate menu).

**Not in Next admin:** product **modifier** groups/options — use Django Admin → Modifier groups/options.

### Öppettider (`/admin/oppettider`)

- Weekly opening hours per weekday.
- **Special closures** (date + reason) for holidays or private events.

Official baseline hours live in code (`official_hours`) and seeds; day-to-day corrections belong here.

### Inställningar (`/admin/installningar`)

- Capacity-related settings: max guests/slot, party size, booking horizon, lead time, etc.
- **`production_ready`:** controls whether **online booking is enabled**.

**Safety:** Do **not** set `production_ready=true` until the owner confirms real capacity and notify channels. Deploys must not flip this automatically.

## What you do in Django Admin (when needed)

Log in at the API `/admin/` with the same staff account (Django session).

| Model | Typical use |
|-------|-------------|
| News items | Publish news posts (`is_published`, body, slug) |
| Gallery items | Publish gallery images / alt / sort order |
| Modifier groups & options | Extra choices on dishes (no Next UI) |
| Reservations / hours / settings | Emergency edits if Next admin is unavailable |
| Contact / event inquiries | Readonly archive |
| Opening hours / closures / reservation settings | Same data Next admin edits |

There is **no** CMS for legal pages (`/integritetspolicy`, `/cookies`, …) or NAP phone/address in admin — those are code/config. Do not invent UI controls that are not listed above.

## Operational workflows

### Morning

1. Sign in → Overview + Bokningar for today.
2. Confirm hours/closures if a special day.
3. Skim Förfrågningar for overnight messages.

### When a guest calls to change a booking

1. Find the reservation in Bokningar (name/date/ref).
2. Update status or ask ops if the UI cannot express the change.
3. If they never got email/Telegram staff alert, check flags / resend after env is healthy.

### Menu update

1. Edit in Meny (pick the tab that matches the public `/meny` section).
2. Public `/meny` refreshes via on-demand revalidation when `FRONTEND_REVALIDATE_URL` + `FRONTEND_REVALIDATE_SECRET` are set; otherwise wait up to ~1 minute (ISR) and hard-refresh.
3. Confirm the dish shows with correct price and image.

### Holiday closure

1. Add a special closure date + reason under Öppettider.
2. Verify availability for that date shows closed.

## Common mistakes

| Mistake | Result | Do instead |
|---------|--------|------------|
| Enable `production_ready` early | Guests can book before you are ready | Owner confirmation first |
| Delete products casually | Broken references / rework | Mark unavailable |
| Upload huge/non-image files | Rejected upload | Resize; use JPG/PNG/WebP ≤5MB |
| Expect Next admin to edit news/gallery | No screen there | Use Django Admin |
| Commit or paste `.env` secrets into chat | Security incident | Ops rotates secrets |
| Hammer login/booking after errors | HTTP 429 throttle | Wait and retry sparingly |

## Escalation

| Problem | Who |
|---------|-----|
| Password / staff access / cookies | Ops (Majd) |
| Site/API down, deploy, DNS, TLS | Ops |
| Notifications not sending | Ops (VPS env) + resend after fix |
| “Should we open online booking?” | Owner |
| Suspected security issue | Ops privately — see [bug-triage.md](../ops/bug-triage.md) |

Bugs and incidents: [bug-triage.md](../ops/bug-triage.md) · symptoms: [troubleshooting.md](../ops/troubleshooting.md).
