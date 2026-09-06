# NAP consistency — Riva Bistro

**Authoritative address (source of truth):**  
`Hornsbergs Strand 57, 112 16 Stockholm`  
Defined in [`frontend/src/config/business.ts`](../../frontend/src/config/business.ts).

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
| Live homepage NAP | Hornsbergs Strand 57 (verified against production) |
| Repo search for `Strandvägen` | **No matches** |
| Maps embed / `mapUrl` | Derived from the same `business` address |

**Conclusion:** The website and codebase are consistent. Do **not** change site content to “disprove” Strandvägen. That looks spammy and does not fix citations.

## Strandvägen conflict (external)

Crawled/indexed results that mention **Strandvägen 5** (or similar) are almost certainly from:

- Stale Google Business Profile data
- Old Search index snapshots
- Third-party directories (Hitta, Eniro, Apple Maps, TripAdvisor, Facebook, etc.)

Those must be corrected **outside** the repo.

## Owner cleanup checklist (outside Cursor)

1. **Google Business Profile** — confirm primary address is Hornsbergs Strand 57, 112 16 Stockholm; remove any Strandvägen listing.
2. **Google Search Console** — verify property for `rivabistro.se`; request indexing of `/` and `/kontakt`; inspect URL for address in rendered HTML.
3. **Apple Maps / Maps Connect** — claim and correct if wrong.
4. **Hitta.se / Eniro / Guide companies** — update or claim listings.
5. **Facebook / Instagram location** — match Hornsbergs Strand 57.
6. **TripAdvisor / TheFork / booking partners** — align address if listed.
7. Re-check in 2–4 weeks that Google’s Knowledge Panel / Maps pin shows Hornsbergs Strand 57.

## Rules for future code changes

- Edit NAP only in `frontend/src/config/business.ts` (and backend hours sync if needed).
- Never hardcode a second street address in pages, embeds, or schema.
- Do not invent geo coordinates, price range, or social `sameAs` until confirmed.
- Keep `business.verified = false` until social URLs are owner-confirmed (JSON-LD `sameAs` gate).
