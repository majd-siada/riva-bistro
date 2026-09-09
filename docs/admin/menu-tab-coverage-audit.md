# Menu tab coverage audit

Date: 2026-09-09  
Branch: `cursor/menu-tab-coverage-155f`  
PR: https://github.com/majd-siada/riva-bistro/pull/31

## Architecture (no duplicated entities)

All six public `/meny` tabs share `catalog.Category` + `catalog.Product`.  
Admin IA: **Meny → six section tabs** (Swedish labels unchanged).

| Public Section | Slug | Admin | Product category |
|---|---|---|---|
| Dagens lunch | `dagens-lunch` | `/admin/meny?section=dagens-lunch` | section root |
| RIVAS MENY | `rivas-meny` | `/admin/meny?section=rivas-meny` | course child (e.g. `forratter`) |
| TAKE AWAY | `take-away` | `/admin/meny?section=take-away` | section root |
| STORA SÄLLSKAPSMENY | `stora-sallskapsmeny` | `/admin/meny?section=stora-sallskapsmeny` | section root |
| SNACKS & DRINKAR | `snacks-drinkar` | `/admin/meny?section=snacks-drinkar` | section root |
| DRYCK | `dryck` | `/admin/meny?section=dryck` | section root |

APIs: `/api/v1/admin/menu/*` (staff CRUD) → `/api/v1/menu/*` (public read).

## Fixes shipped

1. Inactive top-level sections are no longer reinjected from static shells on public `/meny`.
2. Empty live product lists no longer fall back to static dish data.
3. Admin Meny helper text maps each tab to `/meny#…`; staff guide lists all six sections.
4. Local docker-compose wires `FRONTEND_REVALIDATE_*` so Admin writes invalidate public ISR.

## Public-Content Coverage Matrix

| Public Section | Admin Management | Data Source | API | Database Entity | CRUD | Visibility | Ordering | Public Sync | Status |
|---|---|---|---|---|---|---|---|---|---|
| Dagens lunch | Meny → Dagens lunch | Category + Product | admin+public menu | Category, Product | Y | Y | sort_order | Y | COMPLETE |
| RIVAS MENY | Meny → RIVAS MENY | Parent + courses + Product | same | same | Y | Y | Y | Y | COMPLETE |
| TAKE AWAY | Meny → TAKE AWAY | Category + Product | same | same | Y | Y | Y | Y | COMPLETE |
| STORA SÄLLSKAPSMENY | Meny → STORA SÄLLSKAPSMENY | Category + Product | same | same | Y | Y | Y | Y | COMPLETE |
| SNACKS & DRINKAR | Meny → SNACKS & DRINKAR | Category + Product | same | same | Y | Y | Y | Y | COMPLETE |
| DRYCK | Meny → DRYCK | Category + Product | same | same | Y | Y | Y | Y | COMPLETE |

## Acceptance tests (all six)

For each section: create → public visible → availability hide → delete/deactivate safely → cleanup.

| Suite | Result |
|---|---|
| Django `test_menu_section_coverage.py` + `test_menu_sections.py` | 22 passed |
| Vitest `public-menu.test.ts` | 7 passed |
| Playwright UI × 6 sections | 6/6 PASS |
| API session lifecycle × 6 | 6/6 PASS |

COMPLETE means the restaurant owner can manage the section’s underlying content and verified changes appear on the public website (with ISR revalidation configured).
