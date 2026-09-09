# NAP consistency — Riva Bistro

## Sources of truth

| Context | Authoritative source | Notes |
|---------|----------------------|-------|
| **Operational / public marketing** (footer, kontakt, JSON-LD, hours strip) | Django `RestaurantProfile` via `/api/v1/restaurant/` → `loadRestaurantBusiness()` | No day-to-day Admin editor — change via seed/ops if needed |
| **Legal / policy pages** (`/villkor`, `/integritetspolicy`, `/bokningspolicy`) | Static [`frontend/src/config/business.ts`](../../frontend/src/config/business.ts) | Intentional build-time constants |
| **Client booking form contact copy** | Same `business.ts` mirror | Must match profile; unit-tested |

`business.ts` is a **static legal/build-time mirror**, not a competing CMS. Values must stay identical to the live profile.

**Canonical NAP (owner-confirmed):**

| Field | Value |
|-------|--------|
| Name | Riva Bistro |
| Street | Hornsbergs Strand 57 |
| Postal | 112 16 |
| City | Stockholm |
| Area (copy) | Kungsholmen |
| Phone | 087042050 / +4687042050 |
| Email | info@rivabistro.se |
| Site | https://rivabistro.se |

## In-repo / live site audit

| Check | Result |
|-------|--------|
| `business.ts` address | Hornsbergs Strand 57 |
| RestaurantProfile API (live) | Same NAP when populated |
| Live homepage NAP | Hornsbergs Strand 57 (verified against production) |
| Maps embed / `mapUrl` | Derived from the same address fields |

**Conclusion:** Public site and legal mirror share one NAP. Do not introduce a second street address.

## External citation consistency

If search engines or directories show a different street than Hornsbergs Strand 57, the source is almost certainly outside this repo:

- Stale Google Business Profile data
- Old Search index snapshots
- Third-party directories (Hitta, Eniro, Apple Maps, TripAdvisor, Facebook, etc.)

Those must be corrected **outside** the repo.

## Owner cleanup checklist (outside Cursor)

1. **Google Business Profile** — confirm primary address is Hornsbergs Strand 57, 112 16 Stockholm; remove any incorrect listing.
2. **Google Search Console** — verify property for `rivabistro.se`; request indexing of `/` and `/kontakt`; inspect URL for address in rendered HTML.
3. **Apple Maps / Maps Connect** — claim and correct if wrong.
4. **Hitta.se / Eniro / Guide companies** — update or claim listings.
5. **Facebook / Instagram location** — match Hornsbergs Strand 57.
6. **TripAdvisor / TheFork / booking partners** — align address if listed.
7. Re-check in 2–4 weeks that Google’s Knowledge Panel / Maps pin shows Hornsbergs Strand 57.

## Rules for future code changes

- Edit NAP in [`frontend/src/config/business.ts`](../../frontend/src/config/business.ts) and keep `RestaurantProfile` (seed/ops) aligned.
- Never hardcode a second street address in pages, embeds, or schema.
- Do not invent geo coordinates, price range, or social `sameAs` until confirmed.
- Keep `business.verified = false` / profile `verified=false` until social URLs are owner-confirmed (JSON-LD `sameAs` gate).
