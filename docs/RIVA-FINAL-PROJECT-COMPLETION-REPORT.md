# RIVA FINAL VERIFICATION REPORT — Handoff closure

**Project:** Riva Bistro  
**Branch:** `cursor/handoff-closure`  
**Base:** `main` @ `fcf3752` (includes merged PR #32)  
**Date:** 2026-09-09  
**Scope:** Brochure site + table reservations + staff CMS (commerce out of scope)

---

## 1. EXECUTIVE SUMMARY

Closed remaining SoT, admin discoverability, booking-gate, and documentation gaps after merging PR #32:

- **Menu SoT:** Django Catalog is the only dish source; empty/API failure never invents `menu.ts` dishes (tests expanded).
- **Booking safety:** `production_ready` is the **only** online-booking gate — `DEBUG` no longer bypasses. Admin shows Live / Avstängd clearly.
- **Admin nav:** Grouped into Översikt / Innehåll / Drift; Lunch remains under Meny tabs.
- **Hours JSON-LD:** Same `loadHours()` path as public UI (from PR #32); unit-tested hour→schema mapping.
- **NAP:** RestaurantProfile operational SoT; `business.ts` documented legal/build-time mirror with canonical NAP tests.
- **Live booking (audit 2026-09-09):** create `RB-X7UM7D` → HTTP 201 + guest email + Telegram + staff email — **LIVE VERIFIED**. Do not describe booking as disabled.

---

## 2. FILES CHANGED (this branch)

| Area | Files |
|------|-------|
| Booking gate | `apps/backend/reservations/availability.py`, models comment, tests |
| Admin UX | `admin-shell.tsx`, `admin/page.tsx`, `installningar/page.tsx` |
| Menu tests | `public-menu.test.ts` |
| Hours JSON-LD test | `json-ld.tsx` (export helper), `json-ld.test.tsx` |
| NAP | `business.ts` comment, `seo.test.ts`, `docs/seo/nap-consistency.md` |
| Docs | matrix, this report, staff-guide, handover, checklist, runbook |

---

## 3. ARCHITECTURE (source of truth)

| Domain | Source of truth | Public consumer | Fallback |
|--------|-----------------|-----------------|----------|
| Menu dishes | Django `Category` / `Product` | `/api/v1/menu/*` → `loadPublicMenu` | Section shells + **empty items** |
| Featured | `Product.is_featured` | `/api/v1/menu/featured/` | `[]` on API failure |
| Hours | Django `OpeningHours` | `/api/v1/hours/` → `loadHours` | `OFFICIAL_OPENING_HOURS` if uninitialized/API error |
| Operational NAP | `RestaurantProfile` | `/api/v1/restaurant/` | `business.ts` |
| Legal NAP | `business.ts` (static mirror) | Legal pages + booking form copy | Must match profile |
| Homepage copy | `SiteContent` | `/api/v1/site-content/` | Defaults in `public-data.ts` |
| News / offers / gallery | Django models | public APIs | Omit section or intentional empty UX |
| Booking gate | `ReservationSettings.production_ready` **only** | availability + create | No DEBUG bypass |

---

## 4. MENU

```
Admin /admin/meny → PostgreSQL → /api/v1/menu/* → loadPublicMenu → /meny
```

Static `menu.ts` = hierarchy/test fixtures only.

Live catalog (audit): **6 categories, 33 products** — LIVE VERIFIED snapshot; staff may change afterward.

---

## 5. BOOKING

| State | Status |
|-------|--------|
| Code ready | DONE — CODE VERIFIED |
| Gate | `production_ready` only (DEBUG cannot bypass) — CODE VERIFIED |
| Live create + notifications | LIVE VERIFIED (`RB-X7UM7D`, 2026-09-09 audit) |
| VPS env (`DJANGO_DEBUG=false`, cookies, secrets) | HUMAN ACTION REQUIRED (re-confirm on host) |
| Owner capacity confirmation / probe cancel | HUMAN ACTION REQUIRED / CLIENT APPROVAL |

---

## 6. ADMIN (discoverable)

| Group | Links |
|-------|-------|
| Översikt | Översikt, Bokningar, Förfrågningar |
| Innehåll | Meny, Startsida, Restaurang, Galleri, Nyheter, Erbjudanden |
| Drift | Öppettider, Inställningar |

Lunch: Meny → Dagens lunch (`/admin/lunch` deep link).

---

## 7. SECURITY

| Item | Status |
|------|--------|
| Repo DEBUG/ALLOWED_HOSTS/CORS/CSRF/cookie Secure+SameSite patterns | CODE VERIFIED |
| Runtime VPS `.env` values | HUMAN ACTION REQUIRED |
| Secrets not in git | CODE VERIFIED (process) |

---

## 8. SEO

| Item | Status |
|------|--------|
| metadata / JSON-LD / sitemap / robots / admin noindex (code) | CODE VERIFIED |
| Google Search Console / indexing / GBP | HUMAN ACTION REQUIRED — not claimable from repo |

---

## 9. TESTS

Run on handoff branch (see CI / local results in final report section J).

---

## 10. REMAINING HUMAN ACTION

- Re-confirm VPS: `DJANGO_DEBUG=false`, cookie domain, CORS/CSRF origins, notify credentials
- Owner: GBP, GSC, social `verified`, legal counsel review
- Optional: cancel audit probe reservation `RB-X7UM7D`
- Physical device / Lighthouse measurement
- Deploy this branch to Hostinger + VPS

---

## 11. FINAL STATUS

**READY FOR HUMAN VERIFICATION**

Not READY FOR CLIENT HANDOFF while VPS re-confirm, GBP/GSC, and owner content/legal remain open.
