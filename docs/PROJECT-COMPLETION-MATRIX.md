# Riva Bistro — Project Completion Matrix

Evidence-based status for the 325-item production readiness checklist.
Product scope: **brochure site + table reservations** (commerce intentionally out of scope per `docs/product/mvp.md`).

## Dependency map

1. Security & configuration → 2. Reservations & notifications → 3. Menu CMS → 4. SEO/content → 5. Legal scaffolding → 6. Ops/backups → 7. Live launch verification (human)

## Summary (Phase 3 security/a11y/QA batch 2026-09-07)

| Status | Count |
|--------|------:|
| DONE | 190 |
| PARTIAL | 69 |
| NOT DONE | 5 |
| BLOCKED — HUMAN ACTION REQUIRED | 61 |
| **Total** | **325** |

Completion percentage (DONE only): **58.5%**

**Phase 3 (authorized):** security tests + repo audit docs (#166/#251/#300/#315), reservation edge inventory (#168 DONE), a11y touch/keyboard/focus/ARIA/automated findings (#134/#142/#144/#149/#253), public production audit (#256), admin shell QA smoke (#235), browser policy docs only (#139). #209/#234 untouched. No Playwright/BrowserStack/Lighthouse CI/CD/S3/Redis/SIEM/GA.


## Status legend

- `DONE` — implemented and verified with evidence (includes intentional N/A with documented scope)
- `PARTIAL` — some implementation; meaningful work/verification remains
- `NOT DONE` — not implemented
- `BLOCKED — HUMAN ACTION REQUIRED` — cannot complete without Majd/external access

---

## PHASE 1 — FOUNDATION

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 1 | Project Definition | DONE | README + docs/product/mvp.md define reservation-only restaurant site | README.md; docs/product/mvp.md |  | Review docs |  |  |
| 2 | Requirements Specification | DONE | MVP phases and non-goals documented | docs/product/mvp.md |  | Review mvp.md |  |  |
| 3 | Scope Definition | DONE | Commerce explicitly removed; brochure + booking | docs/product/mvp.md |  | Review scope |  |  |
| 4 | User Roles | DONE | Public guest + Django staff/admin session auth | apps/backend/core/auth_views.py; frontend/src/app/admin/ |  | Auth tests |  |  |
| 5 | Feature Inventory | DONE | Menu, booking, gallery, contact, events, admin | docs/product/mvp.md; docs/api/README.md |  |  |  |  |
| 6 | Technical Architecture | DONE | Next.js + Django/DRF + Postgres monorepo | docs/architecture/overview.md |  |  |  |  |
| 7 | Database Architecture | DONE | catalog/reservations/core models + migrations | apps/backend/*/models.py; migrations/ |  | migrate --check |  |  |
| 8 | API Architecture | DONE | Versioned /api/v1 + OpenAPI | docs/api/README.md; apps/backend/config/urls.py |  |  |  |  |
| 9 | Environment Strategy | DONE | .env.example + DEBUG guards + Hostinger/VPS split | /.env.example; docs/deployment/ |  |  |  |  |
| 10 | Repository Structure | DONE | frontend/, apps/backend/, docs/, scripts/, docker | /workspace |  |  |  |  |

## PHASE 2 — BRAND & DESIGN

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 11 | Brand Identity | DONE | Riva Bistro black/ivory/gold cinematic identity | frontend/src/app/globals.css; design-system docs |  |  |  |  |
| 12 | Design System | DONE | Tokens + shadcn/Radix components | docs/design-system/; frontend/src/components/ui/ |  |  |  |  |
| 13 | Typography | DONE | Playfair Display + DM Sans local fonts | frontend/src/app/layout.tsx |  |  |  |  |
| 14 | Color System | DONE | CSS variables riva-* palette | frontend/src/app/globals.css |  |  |  |  |
| 15 | Icon System | DONE | lucide-react icons in UI |  |  |  |  |  |
| 16 | Image System | DONE | next/image + media API remotePatterns | frontend/next.config.ts |  |  |  |  |
| 17 | Component Library | DONE | In-repo component inventory documented; UI primitives + feature components | docs/design-system/component-inventory.md; frontend/src/components/ |  | Review inventory |  |  |
| 18 | Responsive Design | PARTIAL | Tailwind breakpoints used; physical device QA pending |  | Browser emulator | Physical device matrix | BLOCKED — HUMAN ACTION REQUIRED |  |
| 19 | Accessibility Design | DONE | Skip link, landmarks, focus-visible, reduced-motion; booking + contact/event forms wire aria-describedby + role=alert | frontend layout/forms | vitest | Manual keyboard spot-check | Formal WCAG audit still PARTIAL elsewhere |  |
| 20 | UI/UX Guidelines | DONE | Design-system docs present | docs/design-system/ |  |  |  |  |

## PHASE 3 — WEBSITE STRUCTURE

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 21 | Information Architecture | DONE | Swedish public routes under frontend/src/app |  |  |  |  |  |
| 22 | Navigation Architecture | DONE | Header + footer nav | header.tsx; footer.tsx |  |  |  |  |
| 23 | Header | DONE | Sticky header with CTA | frontend/src/components/layout/header.tsx |  |  |  |  |
| 24 | Navigation Bar | DONE | Primary nav + mobile sheet |  |  |  |  |  |
| 25 | Footer | DONE | Footer NAP + hours + nav + legal links to /integritetspolicy /cookies /villkor /bokningspolicy | footer.tsx |  | Local :3022 |  |  |
| 26 | Homepage | DONE | Cinematic home with claim-safe copy | frontend/src/app/page.tsx |  |  |  |  |
| 27 | About Page | DONE | /om-oss | frontend/src/app/om-oss/page.tsx |  |  |  |  |
| 28 | Contact Page | DONE | /kontakt + inquiry API | frontend/src/app/kontakt/ |  |  |  |  |
| 29 | Location Page | DONE | Address/map on kontakt + NAP in business.ts | business.ts; kontakt |  |  |  |  |
| 30 | Menu Architecture | DONE | CMS sections → public /meny | catalog/; meny/ |  |  |  |  |
| 31 | Menu Categories | DONE | Hierarchical sections with sort_order | catalog/models.py |  | catalog tests |  |  |
| 32 | Menu Items | DONE | Products with prices via API | catalog/; public-menu |  |  |  |  |
| 33 | Product Details | DONE | Intentional MVP: dish URLs redirect to /meny#category (brochure menu, not ecommerce PDP). Slug resolves or 404s — no fake product pages. | frontend/src/app/meny/[slug]/page.tsx |  | Code review redirect |  |  |
| 34 | Offers | DONE | N/A intentional — no offers feature in MVP scope; no fake offers |  | mvp.md |  |  |  |
| 35 | Gallery | DONE | /galleri + GalleryItem API | galleri/; core models |  |  |  |  |
| 36 | Reviews | DONE | N/A — no fabricated reviews; GBP review strategy is external |  |  | GBP reviews | BLOCKED — HUMAN ACTION REQUIRED |  |
| 37 | FAQ | DONE | Claim-safe FAQ on /kontakt (NAP/phone/email/booking path); no invented menu claims | kontakt/page.tsx; faq.tsx |  | Review FAQ copy |  |  |
| 38 | Legal Pages | PARTIAL | Swedish legal scaffolding pages live in repo with mall disclaimer; counsel approval pending | integritetspolicy/cookies/villkor/bokningspolicy |  | Deploy + legal review | Owner/counsel sign-off | BLOCKED — HUMAN ACTION REQUIRED |
| 39 | Error Pages | DONE | error.tsx + not-found.tsx | frontend/src/app/error.tsx; not-found.tsx |  |  |  |  |
| 40 | 404 Page | DONE | Custom not-found | not-found.tsx |  |  |  |  |

## PHASE 4 — CORE FUNCTIONALITY

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 41 | Authentication | DONE | Staff session login API + Django admin | core/auth_views.py |  | auth tests |  |  |
| 42 | Authorization | DONE | IsAdminUser on admin APIs; public endpoints AllowAny by design |  |  |  |  |  |
| 43 | User Management | DONE | Django auth users for staff only (no customer accounts — N/A) |  |  |  |  |  |
| 44 | Admin Dashboard | DONE | Next /admin + Django /django-admin/ | frontend/src/app/admin/ |  |  |  |  |
| 45 | Content Management | DONE — CODE VERIFIED | Next admin CMS nav includes gallery/news/offers/startsida/restaurang | admin-shell.tsx; admin pages | admin-shell.test.tsx |  | Live content entry |  |
| 46 | Menu Management | DONE — CODE VERIFIED | Admin meny CRUD; Django catalog SoT; no silent static dish fallback | admin/meny; public-menu.ts | public-menu.test.ts; test_menu_section_coverage.py |  | Seed live catalog if empty |  |
| 47 | Category Management | DONE | Section admin + seed commands | catalog/ |  |  |  |  |
| 48 | Product Management | DONE — CODE VERIFIED | Product admin API; inactive categories excluded from public products | catalog/views.py | test_menu_section_coverage.py |  |  |  |
| 49 | Pricing Management | DONE | Product price fields in CMS |  |  |  |  |  |
| 50 | Image Management | PARTIAL | Product/gallery images via media; local disk not S3 | MEDIA settings |  |  | S3 optional later |  |
| 51 | Opening Hours Management | DONE — CODE VERIFIED | Admin öppettider + API; JSON-LD uses loadHours() | reservations; json-ld.tsx |  |  |  |  |
| 52 | Restaurant Information Management | DONE — CODE VERIFIED | Next /admin/restaurang CMS for NAP/social; public + JSON-LD consume API | restaurang/page.tsx; RestaurantProfile |  | Owner confirms verified/social | Owner confirms verified=true | HUMAN ACTION REQUIRED |
| 53 | Contact Management | DONE | Contact inquiry API + admin inbox |  |  |  |  |  |
| 54 | Reservation System | DONE — CODE VERIFIED | Availability + create with locks; production_ready gate | reservations/ |  | reservation tests incl. DEBUG bypass | Live E2E booking | HUMAN ACTION REQUIRED |
| 55 | Reservation Management | DONE — CODE VERIFIED | Admin bokningar list/detail + Notiser column | bokningar/page.tsx |  |  |  |  |
| 56 | Order System | DONE | N/A — commerce out of scope per mvp.md | docs/product/mvp.md |  |  |  |  |
| 57 | Cart System | DONE | N/A — commerce out of scope |  |  |  |  |  |
| 58 | Checkout | DONE | N/A — commerce out of scope |  |  |  |  |  |
| 59 | Payment Integration | DONE | N/A — no payments; do not invent Stripe |  |  |  |  |  |
| 60 | Receipt System | DONE | N/A — no payments |  |  |  |  |  |
| 61 | Notification System | PARTIAL | Telegram+email flags/resend; list Notiser column; VPS delivery unproven | core/notifications/; bokningar/page.tsx | test_notifications.py | verify-notifications.sh on VPS | Confirm live delivery | HUMAN ACTION REQUIRED |

## PHASE 5 — DATA

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 62 | Database Schema | DONE | Models for catalog/reservations/core |  |  |  |  |  |
| 63 | Database Migrations | DONE | Migration files present; CI runs migrate |  | ci.yml |  |  |  |
| 64 | Seed Data | DONE | seed_menu, seed_reservations, seed_admin commands |  |  |  |  |  |
| 65 | Data Validation | DONE | DRF serializers + model constraints |  |  |  |  |  |
| 66 | Data Relationships | DONE | FK/M2M as modeled |  |  |  |  |  |
| 67 | Data Integrity | DONE | Advisory lock + capacity checks on booking |  | tests |  |  |  |
| 68 | Backup Strategy | PARTIAL | backup-postgres.sh + restore-postgres.sh + runbook; VPS cron/restore drill pending | scripts/backup-postgres.sh; scripts/restore-postgres.sh |  | Owner schedules cron | Live restore proof | BLOCKED — HUMAN ACTION REQUIRED |
| 69 | Data Recovery | PARTIAL | Restore script requires CONFIRM_RESTORE=YES; documented in runbook | scripts/restore-postgres.sh; production-runbook.md |  | Restore drill on VPS | Proven restore | BLOCKED — HUMAN ACTION REQUIRED |
| 70 | Data Retention | PARTIAL | Owner fill-in retention template added; periods not decided | docs/ops/data-retention.md |  | Owner sets periods | Counsel approval | BLOCKED — HUMAN ACTION REQUIRED |

## PHASE 6 — SECURITY

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 71 | Authentication Security | DONE | Session auth; login throttle; secret key required in prod | settings.py |  |  |  |  |
| 72 | Authorization Security | DONE | IsAdminUser on admin routes; schema docs staff-only |  |  |  |  |  |
| 73 | Input Validation | DONE | Serializers validate booking/contact payloads |  |  |  |  |  |
| 74 | API Security | DONE | CORS/CSRF production guards; HTTPS cookies |  |  |  |  |  |
| 75 | Rate Limiting | DONE | Scoped write throttles + global AnonRateThrottle enabled; LocMem cache | config/settings.py | test_security_settings.py | pytest | Redis optional at scale |  |
| 76 | CSRF Protection | DONE | Django CSRF + trusted origins |  |  |  |  |  |
| 77 | XSS Protection | DONE | React escaping + SECURE_CONTENT_TYPE_NOSNIFF |  |  |  |  |  |
| 78 | SQL Injection Protection | DONE | Django ORM parameterized queries |  |  |  |  |  |
| 79 | Secrets Management | DONE | Env-only secrets; .env gitignored; .env.example |  |  |  |  |  |
| 80 | Session Security | DONE | HttpOnly session; Secure in prod; SameSite configurable |  |  |  |  |  |
| 81 | File Upload Security | DONE | Product + gallery admin uploads sniff magic + size/extension allowlist | core/images.py; AdminGalleryItemSerializer; catalog admin image view | test_media_uploads.py | pytest 103 |  |  |
| 82 | Payment Security | DONE | N/A — no payments |  |  |  |  |  |
| 83 | Admin Security | DONE | Staff-only; strong password via seed_admin env |  |  | MFA optional | BLOCKED — HUMAN ACTION REQUIRED |  |
| 84 | Audit Logging | PARTIAL | Django LOGGING configured + admin history; no dedicated immutable audit store | config/settings.py |  |  | Optional audit log product |  |
| 85 | Security Headers | DONE | Django HSTS/nosniff/XFO/referrer/COOP; Next security headers + CSP Report-Only | settings.py; next.config.ts | test_security_settings.py |  | Enforce CSP after report review |  |

## PHASE 7 — SEO

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 86 | SEO Strategy | DONE | docs/seo/keyword-map.md |  |  |  |  |  |
| 87 | Keyword Research | DONE | keyword-clusters.csv |  |  |  |  |  |
| 88 | Keyword Mapping | DONE | keyword-map.md primary URL per cluster |  |  |  |  |  |
| 89 | Keyword Clusters | DONE | docs/seo/keyword-clusters.csv |  |  |  |  |  |
| 90 | URL Architecture | DONE | Swedish routes; canonical helper | seo.ts; app routes |  |  |  |  |
| 91 | Title Tags | DONE | createPageMetadata per page |  | seo.test.ts |  |  |  |
| 92 | Meta Descriptions | DONE | Per-page descriptions |  |  |  |  |  |
| 93 | Heading Structure | DONE | Public + legal + admin pages expose a single page-level h1 (LegalDocument + page heroes). Spot-check 2026-09-06. | frontend/src/app/**/page.tsx; legal-document.tsx |  | rg <h1> on page.tsx |  |  |
| 94 | Canonical URLs | DONE | createPageMetadata alternates.canonical | seo.ts |  |  |  |  |
| 95 | Robots.txt | DONE | app/robots.ts disallows /admin |  |  |  |  |  |
| 96 | XML Sitemap | DONE | app/sitemap.ts public routes |  |  |  |  |  |
| 97 | Image SEO | DONE | Source inventory requires alt on Image/RestaurantImage usages; dish cards use dish-name alts; decorative emblem placeholder uses empty alt + aria-hidden. Policy: docs/seo/image-alt-and-optimization.md. CMS gallery alt quality remains owner-controlled content. | docs/seo/image-alt-and-optimization.md; food-card.tsx; product-image.tsx; image-alt-inventory.test.ts | image-alt-inventory.test.ts | vitest image alt inventory | Editorial CMS alt quality (owner content) |  |
| 98 | Internal Linking | DONE | Header/footer/CTAs |  |  |  |  |  |
| 99 | Structured Data | DONE — CODE VERIFIED | Restaurant+WebSite JSON-LD (hours via loadHours); Menu+Breadcrumb JSON-LD. Social sameAs gated by verified. | frontend/src/components/seo/json-ld.tsx | json-ld.test.tsx; seo.test.ts | vitest | Owner verify + Rich Results after verified=true | Confirm social URLs before verified=true |
| 100 | Local SEO | PARTIAL | NAP consistent in code; GBP external | business.ts; nap-consistency.md |  |  | GBP ownership | BLOCKED — HUMAN ACTION REQUIRED |
| 101 | NAP Consistency | DONE | Hornsbergs Strand 57 everywhere in code; Strandvägen scrubbed | business.ts; docs/seo/nap-consistency.md |  |  |  |  |
| 102 | Open Graph | DONE | OG in createPageMetadata |  |  |  |  |  |
| 103 | Twitter/X Cards | DONE | Twitter cards in createPageMetadata |  |  |  |  |  |
| 104 | Breadcrumbs | DONE | Visible breadcrumbs + BreadcrumbList JSON-LD via PageBreadcrumbs on /meny, /boka, and legal pages. | frontend/src/components/seo/page-breadcrumbs.tsx; json-ld.tsx | json-ld.test.tsx | vitest BreadcrumbJsonLd |  |  |
| 105 | Indexation Control | DONE | robots + admin noindex |  |  |  |  |  |

## PHASE 8 — LOCAL BUSINESS

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 106 | Google Business Profile | BLOCKED — HUMAN ACTION REQUIRED | Site NAP/hours code exists in-repo. Google Business Profile claim/edit cannot be done from the repository. |  |  | GBP listing matches Hornsbergs Strand 57 + published hours | Claim/verify GBP; align NAP/hours/photos with site | Majd/business owner: open GBP and complete ownership/claim |
| 107 | Business Information | PARTIAL | business.ts filled; verified=false | business.ts |  |  | Confirm social/kitchen | BLOCKED — HUMAN ACTION REQUIRED |
| 108 | Opening Hours | DONE | API + official_hours seed |  |  |  |  |  |
| 109 | Holiday Hours | DONE | SpecialClosure model + admin |  |  |  |  |  |
| 110 | Location Data | DONE | Address + map URL Hornsbergs Strand 57 |  |  |  |  |  |
| 111 | Contact Data | DONE | Phone 087042050 + email in business.ts |  |  |  |  |  |
| 112 | Google Maps Integration | DONE | Map link/iframe on kontakt |  |  |  |  |  |
| 113 | LocalBusiness Schema | PARTIAL | Implemented but gated off until verified |  |  | Enable after verify | BLOCKED — HUMAN ACTION REQUIRED |  |
| 114 | Restaurant Schema | PARTIAL | Same as JSON-LD gate |  |  | Enable after verify | BLOCKED — HUMAN ACTION REQUIRED |  |
| 115 | Menu Schema | DONE | MenuJsonLd emits schema.org Menu/MenuSection/MenuItem from live buildMenuPanels data on /meny (no invented dishes). | frontend/src/components/seo/json-ld.tsx; app/meny/page.tsx | json-ld.test.tsx | vitest MenuJsonLd |  |  |
| 116 | Review Strategy | BLOCKED — HUMAN ACTION REQUIRED | Repo intentionally has no fabricated reviews. Review acquisition depends on GBP/customer process outside the codebase. |  |  | Real GBP reviews appear; site still has no fake quotes | Define and run GBP review request process | Majd: operate GBP reviews; do not invent testimonials in code |

## PHASE 9 — PERFORMANCE

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 117 | Performance Audit | PARTIAL | No formal Lighthouse CI evidence yet |  |  | Run Lighthouse on prod | BLOCKED — HUMAN ACTION REQUIRED |  |
| 118 | Core Web Vitals | BLOCKED — HUMAN ACTION REQUIRED | No CrUX/field Core Web Vitals dataset is claimed. Lab tooling was not added in gap-closure. |  |  | Field CWV report reviewed; no invented scores | Observe field CWV after sufficient traffic (Search Console/CrUX) | Majd/host: review field CWV when data exists |
| 119 | Image Optimization | PARTIAL | next/image with fill/sizes, hero priority, and remotePatterns were already in use and are documented in docs/seo/image-alt-and-optimization.md. Phase 1 did not perform substantial asset optimization, compression, or an image optimization pipeline. Not a Core Web Vitals claim. | restaurant-image.tsx; product-image.tsx; next.config.ts; docs/seo/image-alt-and-optimization.md |  | Code + doc review | Meaningful asset optimization/compression/pipeline work; field CWV/perf (#118/#299) |  |
| 120 | Image Formats | PARTIAL | Depends on sources; WebP via next/image where possible |  |  |  |  |  |
| 121 | Lazy Loading | DONE | next/image default lazy for non-priority |  |  |  |  |  |
| 122 | Code Splitting | DONE | Next App Router automatic splitting |  |  |  |  |  |
| 123 | Caching | DONE | Catalog/hours/news/gallery fetches use explicit Next revalidate TTLs (catalog 60s aligned with /meny page; hours 300; news 120; gallery 300). Availability/health/writes remain cache: no-store. Documented in docs/architecture/models.md; unit-tested via resolveFetchCacheOptions. No Redis. | frontend/src/lib/api.ts; docs/architecture/models.md | api.test.ts cache options | vitest resolveFetchCacheOptions |  |  |
| 124 | CDN | BLOCKED — HUMAN ACTION REQUIRED | Frontend is intended for Hostinger static/CDN hosting; CDN product settings are outside the repo. |  |  | CDN/cache headers as configured by host | Confirm Hostinger CDN/caching settings for rivabistro.se | Majd: Hostinger panel CDN confirmation |
| 125 | Font Optimization | DONE | next/font/local with display swap |  |  |  |  |  |
| 126 | JavaScript Optimization | DONE | Inspected client boundaries/deps; removed unnecessary FoodCard client boundary; lucide optimizePackageImports; CookieNotice next/dynamic chunk; reproducible `npm run analyze` (@next/bundle-analyzer). Measured First Load JS: shared 102 kB, `/` and `/meny` 124 kB (2026-09-07 build). Not a Lighthouse/CWV claim. | frontend/next.config.ts; food-card.tsx; layout.tsx; docs/architecture/javascript-optimization.md |  | next build + analyze HTML under .next/analyze | Further route-level wins optional; field perf separate |  |
| 127 | CSS Optimization | DONE | Tailwind purged build |  |  |  |  |  |
| 128 | Server Optimization | PARTIAL | Production API image runs gunicorn (`--workers 2`, timeout 60) via Dockerfile/compose. This is configured production WSGI operation only — no measured worker sizing, load test, or nginx tuning evidence in-repo. | infrastructure/docker/Dockerfile.backend; docker-compose.production.yml |  | Compose/Dockerfile review | Measured optimization / host nginx tuning if required | Nginx/TLS proxy tuning remains host-ops |
| 129 | Database Optimization | PARTIAL | Indexes on sort_order; no full query audit |  |  |  |  |  |
| 130 | API Optimization | PARTIAL | Select-related where needed; ongoing |  |  |  |  |  |

## PHASE 10 — MOBILE & RESPONSIVE

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 131 | Mobile Layout | PARTIAL | Responsive Tailwind; emulator only |  |  | Physical devices | BLOCKED — HUMAN ACTION REQUIRED |  |
| 132 | Tablet Layout | PARTIAL | Same |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 133 | Desktop Layout | DONE | Designed desktop-first cinematic |  |  |  |  |  |
| 134 | Touch Optimization | PARTIAL | Public interactive targets improved: Button sm/icon min sizes raised; menu chips `min-h-11`/`min-h-10`; booking slot chips `min-h-11`. Static verification in `touch-targets.test.ts`. Not physical touch QA. | button.tsx; menu-category-nav.tsx; reservation-form.tsx | touch-targets.test.ts | vitest static classes | Physical device touch QA |  |
| 135 | Mobile Navigation | DONE | Sheet/menu for mobile nav |  |  |  |  |  |
| 136 | Mobile Forms | PARTIAL | Booking/contact/event forms use responsive Tailwind layouts, full-width controls, and mobile-friendly input types with accessible error wiring. Verification here is code + browser emulation only — physical-device validation is not claimed (#140/#161). | frontend/src/components/features/booking/; contact/event forms | form unit tests where present | Browser emulator only | Physical phone/tablet form validation |  |
| 137 | Mobile Checkout | DONE | N/A — no checkout |  |  |  |  |  |
| 138 | Mobile Performance | BLOCKED — HUMAN ACTION REQUIRED | Responsive CSS exists; no field mobile performance measurements are claimed. |  |  | Documented mobile measurement results (no invented scores) | Measure mobile performance on production (lab and/or field) | Majd: run mobile measurement on live site |
| 139 | Cross-Browser Compatibility | PARTIAL | Supported-browser **policy** documented for evergreen desktop/mobile based on Next 15 stack. No multi-browser harness or Safari/Firefox/Edge/iOS execution claimed. | docs/compatibility/supported-browsers.md |  | Doc review | Formal multi-browser matrix only if product authorizes (#162) |  |
| 140 | Device Testing | BLOCKED — HUMAN ACTION REQUIRED | Browser emulation can be used in this environment; physical device lab is unavailable here. |  |  | Signed device QA notes | Physical iOS/Android device QA checklist | Majd/QA: test on real phones/tablets |

## PHASE 11 — ACCESSIBILITY

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 141 | WCAG Audit | DONE | Automated WCAG findings report published (docs/accessibility/wcag-automated-findings.md) with axe-core smoke on Button/StateMessage/PageBreadcrumbs + token contrast tests. Explicitly NOT formal WCAG certification; keyboard/SR/device audits remain separate PARTIAL/BLOCKED rows. | docs/accessibility/wcag-automated-findings.md; axe-smoke.a11y.test.tsx; contrast.test.ts | axe-smoke.a11y.test.tsx; contrast.test.ts | vitest axe + contrast | Manual keyboard/SR/formal certification if required (#142/#143) |  |
| 142 | Keyboard Navigation | PARTIAL | Automated interaction tests: skip-link Tab focus, FAQ Enter toggle, Dialog Escape focus restore, Sheet Escape close. Not a full-site manual keyboard audit. | keyboard-focus.a11y.test.tsx; app-shell.tsx; faq.tsx; dialog/sheet | keyboard-focus.a11y.test.tsx | vitest + user-event | Exhaustive manual keyboard path audit |  |
| 143 | Screen Reader Support | PARTIAL | Semantic HTML + labels; SR testing limited |  |  |  |  |  |
| 144 | Focus Management | PARTIAL | Real interaction tests for skip-link focus, Radix Dialog focus restore on Escape, Sheet open/close. Uses existing Radix focus behavior — no custom focus framework. Not a full route-focus/AT audit. | keyboard-focus.a11y.test.tsx; dialog.tsx; sheet.tsx; app-shell.tsx | keyboard-focus.a11y.test.tsx | vitest interactions | Full focus/AT audit across routes |  |
| 145 | Color Contrast | DONE | Token pairs cream/muted/gold/error/success on black/surface/card meet WCAG AA (≥4.5) in contrast.test.ts. Placeholder opacity raised muted/70→muted/80. Disabled slot text (muted/40) intentionally exempt and documented. | frontend/src/lib/contrast.ts; contrast.test.ts; input.tsx; textarea.tsx | contrast.test.ts | vitest contrast ratios | Photo overlay contrast not token-checked |  |
| 146 | Alt Text | DONE | Alt inventory test enforces alt props on Image/RestaurantImage; meaningful dish/scene alts; decorative placeholder empty alt. Shared policy with #97. | docs/seo/image-alt-and-optimization.md; image-alt-inventory.test.ts | image-alt-inventory.test.ts | vitest | CMS-uploaded alt editorial quality |  |
| 147 | Form Accessibility | DONE | Reservation + contact + event forms: labels, aria-invalid, aria-describedby, role=alert | reservation-form; contact-form; event-inquiry-form |  | Keyboard + SR spot-check |  |  |
| 148 | Semantic HTML | DONE | header/main/footer/nav/address |  |  |  |  |  |
| 149 | ARIA | DONE | Code ARIA/semantics review: FAQ gained `aria-controls`/panel ids/`aria-labelledby`/decorative chevron `aria-hidden`; forms/nav/landmarks reviewed as appropriate; axe includes FAQ. Prefer native HTML; no ARIA spray. Screen-reader verification remains external. | faq.tsx; docs/accessibility/aria-review.md | axe-smoke + FAQ assertions | vitest-axe | Screen-reader name/role/value checks |  |
| 150 | Reduced Motion | DONE | prefers-reduced-motion in CSS + reveal observer |  |  |  |  |  |

## PHASE 12 — TESTING

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 151 | Unit Testing | DONE | pytest + vitest in CI |  | ci.yml |  |  |  |
| 152 | Integration Testing | DONE | API reservation/notification tests |  | pytest |  |  |  |
| 153 | API Testing | DONE | DRF tests for menu/reservations/auth |  |  |  |  |  |
| 154 | End-to-End Testing | NOT DONE | No Playwright/Cypress suite. Intentionally not added in gap-closure to avoid infra-only % gains; manual QA checklist remains. Defer automated E2E unless product prioritizes. |  |  | Add smoke e2e optional | Optional Playwright smoke post-MVP |  |
| 155 | UI Testing | PARTIAL | Focused UI smoke/component vitest coverage only (Button variants, StateMessage roles, PageBreadcrumbs). Not broad UI-flow testing; meaningful coverage of menu/reservation/contact/admin UI behaviors remains. | frontend/src/components/ui/ui-smoke.test.tsx | ui-smoke.test.tsx | vitest | Broader meaningful UI-flow coverage beyond component smoke |  |
| 156 | Form Testing | DONE | ContactForm + ReservationForm vitest: validation, successful submit (mocked API), API failure UI. No real production bookings/emails. | contact-form.test.tsx; reservation-form.test.tsx | vitest form suites | vitest |  |  |
| 157 | Authentication Testing | DONE | Admin auth tests exist |  |  |  |  |  |
| 158 | Authorization Testing | DONE | Admin permission checks in tests |  |  |  |  |  |
| 159 | Payment Testing | DONE | N/A |  |  |  |  |  |
| 160 | Reservation Testing | DONE | Availability/booking/notification suites |  |  |  |  |  |
| 161 | Mobile Testing | BLOCKED — HUMAN ACTION REQUIRED | Automated/emulated checks do not replace physical mobile testing for this requirement. |  |  | Device matrix results recorded | Physical mobile test pass | Majd/QA: physical device testing |
| 162 | Browser Testing | NOT DONE | No multi-browser test matrix has been implemented or executed. This is not blocked by missing owner credentials — it is simply not done. Do not equate absence of a run with an external human blocker. |  |  |  | Optional Playwright/multi-browser smoke if prioritized (not added in this correction) |  |
| 163 | Accessibility Testing | DONE | axe-core smoke tests in vitest (Button, StateMessage alert, breadcrumbs). Does not replace keyboard/SR/device testing. | axe-smoke.a11y.test.tsx; package.json axe-core/vitest-axe | axe-smoke.a11y.test.tsx | vitest | Manual AT (#143) / keyboard (#142) |  |
| 164 | SEO Testing | PARTIAL | Unit tests cover `createPageMetadata`, NAP helpers, `business.verified===false` gate, and Menu/Breadcrumb JSON-LD render smoke. Crawler validation, Rich Results, and live SERP checks are not proven. | frontend/src/lib/seo.test.ts; components/seo/json-ld.test.tsx | vitest | npm test (unit only) | Live SEO/crawler/Rich Results validation |  |
| 165 | Performance Testing | NOT DONE | No Lighthouse/CWV CI harness. Not invented scores. Lab/field measurement remains human (#118/#167–170/#299). Keep NOT DONE until a real perf harness exists. |  |  |  | Add Lighthouse CI only if prioritized |  |
| 166 | Security Testing | DONE | Deterministic local security tests expanded: throttle wiring, cookie flags, production security flag source asserts, OpenAPI staff-only, CSRF-enforced admin write, malformed JSON safe errors, plus existing authz/throttle/upload/hardening suites. Explicitly **not** a penetration test. | test_security_settings.py; test_api_hardening.py; test_throttle_behavior.py; test_media_uploads.py; test_admin_auth.py | pytest security modules | 135 pytest green | External pentest optional |  |
| 167 | Error Handling Testing | DONE | Form suites assert availability network failure, reservation create ApiError, and contact API failure render user-visible alerts without stack traces. | reservation-form.test.tsx; contact-form.test.tsx | vitest | vitest |  |  |
| 168 | Edge Case Testing | DONE | Reservation-domain edge inventory maps capacity/full, closures, past, duplicates/idempotent, party/horizon, production_ready vs closed, validation, hours alignment → existing pytest. No chaos/load framework. Live race testing external/unclaimed. | docs/testing/reservation-edge-cases.md; reservations/tests/test_reservations.py | test_reservations.py | pytest reservation suite | Production concurrent race/load (optional) |  |
| 169 | Regression Testing | DONE | CI on PR |  |  |  |  |  |
| 170 | Production Smoke Testing | DONE | scripts/production-check.sh Passed 11 Failed 0 against live hosts this session | scripts/production-check.sh |  | Re-run before each release |  |  |

## PHASE 13 — CONTENT

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 171 | Final Copy | PARTIAL | Claim-safe HIGH pages updated; owner may refine | page copies |  |  | Owner copy review | BLOCKED — HUMAN ACTION REQUIRED |
| 172 | Menu Content | PARTIAL | CMS-managed; depends on seeded/admin data |  |  | Owner maintains menu | BLOCKED — HUMAN ACTION REQUIRED |  |
| 173 | Product Descriptions | PARTIAL | From CMS |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 174 | Pricing | PARTIAL | From CMS |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 175 | Restaurant Information | PARTIAL | business.ts; verified=false |  |  | Confirm remaining fields | BLOCKED — HUMAN ACTION REQUIRED |  |
| 176 | Contact Information | DONE | Phone/email/address set |  |  |  |  |  |
| 177 | Opening Hours | DONE | Official hours seeded + admin editable |  |  |  |  |  |
| 178 | Images | PARTIAL | Some assets present; complete library owner-dependent |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 179 | Logo Assets | DONE | Logo component/assets in brand |  |  |  |  |  |
| 180 | Legal Content | PARTIAL | Legal scaffolding content in repo; not counsel-approved | legal pages |  | Legal review |  | BLOCKED — HUMAN ACTION REQUIRED |
| 181 | Privacy Policy | PARTIAL | /integritetspolicy scaffolding + disclaimer | integritetspolicy/page.tsx |  | Legal approval |  | BLOCKED — HUMAN ACTION REQUIRED |
| 182 | Cookie Policy | PARTIAL | /cookies scaffolding + cookie notice link | cookies/page.tsx |  | Legal approval |  | BLOCKED — HUMAN ACTION REQUIRED |
| 183 | Terms & Conditions | PARTIAL | /villkor scaffolding | villkor/page.tsx |  | Legal approval |  | BLOCKED — HUMAN ACTION REQUIRED |
| 184 | Reservation Policy | PARTIAL | /bokningspolicy scaffolding (booking + cancellation) | bokningspolicy/page.tsx |  | Legal approval |  | BLOCKED — HUMAN ACTION REQUIRED |
| 185 | Cancellation Policy | PARTIAL | Cancellation text included in bokningspolicy scaffolding | bokningspolicy/page.tsx |  | Legal approval |  | BLOCKED — HUMAN ACTION REQUIRED |

## PHASE 14 — ANALYTICS & TRACKING

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 186 | Analytics Setup | DONE | Intentional absence — necessary cookies only; no ad trackers | cookie-notice.tsx |  |  | Optional privacy analytics later |  |
| 187 | Google Tag Manager | DONE | Intentionally not installed (policy) |  |  |  |  |  |
| 188 | Google Analytics | DONE | Intentionally not installed (policy) |  |  |  |  |  |
| 189 | Search Console | BLOCKED — HUMAN ACTION REQUIRED | robots.txt/sitemap exist in the Next app. Search Console property verification requires owner Google account. |  |  | Property verified in GSC | Verify GSC property for rivabistro.se | Majd: Google Search Console verification |
| 190 | Conversion Tracking | DONE | N/A without third-party analytics; booking success is first-party UI state |  |  |  |  |  |
| 191 | Event Tracking | DONE | Policy: no third-party event pixels |  |  |  |  |  |
| 192 | Reservation Tracking | PARTIAL | First-party reservation rows persist in Django DB and are visible in admin bokningar. This is reservation persistence/ops visibility — not analytics or conversion tracking. No GA/GTM reservation events (intentional MVP first-party-only policy). | apps/backend/reservations/; frontend/src/app/admin/bokningar/ | reservation API tests | Admin list / API create tests | If product later requires analytics-style reservation tracking, define and implement separately |  |
| 193 | Order Tracking | DONE | N/A — no orders |  |  |  |  |  |
| 194 | Payment Tracking | DONE | N/A — no payments |  |  |  |  |  |
| 195 | Error Monitoring | PARTIAL | Env-gated Sentry init when SENTRY_DSN set; empty = no-op | settings.py; .env.example |  | Owner sets DSN + installs sentry-sdk | Live DSN | BLOCKED — HUMAN ACTION REQUIRED |
| 196 | Performance Monitoring | BLOCKED — HUMAN ACTION REQUIRED | Optional Sentry init is env-gated; no APM/pager is configured in-repo. Host metrics live in Hostinger/VPS panels. |  |  | Dashboards reachable; alerts optional | Choose monitoring approach and enable host/APM dashboards | Majd: enable Hostinger/VPS metrics and/or SENTRY_DSN if desired |

## PHASE 15 — INFRASTRUCTURE

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 197 | Domain | BLOCKED — HUMAN ACTION REQUIRED | Code and smoke checks assume rivabistro.se; registrar ownership/billing is external. |  |  | Owner can manage DNS at registrar/Hostinger | Confirm domain registration ownership and renewal | Majd: registrar ownership confirmation |
| 198 | DNS | BLOCKED — HUMAN ACTION REQUIRED | Public DNS may be inspected without console access; DNS change authority is Hostinger/registrar. |  |  | A/CNAME/MX match intended hosts | Confirm DNS records match intended Hostinger/VPS targets | Majd: Hostinger DNS ownership/control |
| 199 | SSL | DONE | `scripts/production-check.sh` validates live HTTPS certificates for frontend and API hosts via openssl (`tls_ok`) and reported Passed in the gap-closure run (11/11 including TLS checks). TLS terminates at proxy; this DONE covers certificate readability/presence, not full host hardening. | scripts/production-check.sh |  | production-check TLS checks Passed |  |  |
| 200 | Hosting | DONE | Hostinger frontend + VPS API documented | docs/deployment/ |  |  |  |  |
| 201 | Production Server | PARTIAL | docker-compose.production.yml; live verify external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 202 | Database Server | PARTIAL | Postgres on VPS; access external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 203 | Environment Variables | DONE | .env.example documents keys |  |  |  |  |  |
| 204 | Production Secrets | BLOCKED — HUMAN ACTION REQUIRED | Secrets are env-based and gitignored; production secret values must exist only on hosts. |  |  | Services start; no secrets in git | Confirm production env files on VPS/Hostinger without committing secrets | Majd: place/rotate production secrets on hosts |
| 205 | Email Configuration | PARTIAL | Code ready; VPS env unproven |  | verify-notifications | Confirm delivery | BLOCKED — HUMAN ACTION REQUIRED |  |
| 206 | Storage Configuration | PARTIAL | Local MEDIA_ROOT; S3 future |  |  |  |  |  |
| 207 | CDN Configuration | BLOCKED — HUMAN ACTION REQUIRED | No in-repo CDN provider config files. CDN is a Hostinger/host concern. |  |  | CDN serving static assets as intended | Configure/confirm CDN in Hostinger if used | Majd: Hostinger CDN configuration |
| 208 | Backup Configuration | PARTIAL | Backup scripts present; schedule/retention on VPS pending | scripts/backup-postgres.sh |  | Cron on VPS |  | BLOCKED — HUMAN ACTION REQUIRED |
| 209 | Monitoring Configuration | PARTIAL | Health endpoint + optional Sentry; no pager | health; SENTRY_DSN | production-check |  | Alerts external |  |
| 210 | Logging Configuration | DONE | Django LOGGING dict with console handlers; no secrets in formatters | config/settings.py | pytest |  |  |  |

## PHASE 16 — CI/CD & DEPLOYMENT

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 211 | Git Workflow | DONE | Feature branches + PRs |  |  |  |  |  |
| 212 | Branch Protection | BLOCKED — HUMAN ACTION REQUIRED | PR/CI workflow exists in-repo. Branch protection rules are GitHub repository settings outside the codebase. |  |  | Protected branch requires CI/review | Enable required checks / review rules on default branch | Majd/GitHub admin: branch protection settings |
| 213 | Code Review | PARTIAL | PR workflow; enforcement external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 214 | CI Pipeline | DONE | .github/workflows/ci.yml lint/test |  |  |  |  |  |
| 215 | Automated Tests | DONE | pytest + vitest in CI |  |  |  |  |  |
| 216 | Build Pipeline | DONE | CI runs npm run build (production Next build) | .github/workflows/ci.yml | CI |  |  |  |
| 217 | Deployment Pipeline | PARTIAL | GitHub Actions CI runs lint/test/build (`.github/workflows/ci.yml`). Production deploy remains manual per runbook (VPS git pull / Hostinger rebuild). There is no automated CD/deploy job — do not call this an automated deployment pipeline. | .github/workflows/ci.yml; docs/deployment/production-runbook.md | CI on PRs | Workflow + runbook review | Automated CD only if product prioritizes it |  |
| 218 | Staging Environment | BLOCKED — HUMAN ACTION REQUIRED | Deploy docs describe production only. No staging host/DNS/credentials are available to this agent. | docs/deployment/ |  | Staging frontend/API health checks pass | Provision staging VPS/DNS and document URLs/secrets out-of-band | Majd: create staging environment and share access |
| 219 | Production Environment | PARTIAL | Documented; live access external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 220 | Database Migration Deployment | DONE | entrypoint migrate; runbook |  |  |  |  |  |
| 221 | Rollback Strategy | DONE | Documented in runbook |  |  |  |  |  |
| 222 | Zero-Downtime Deployment | PARTIAL | True ZDD is **not** implemented. Accepted MVP limitation documented: manual Hostinger+VPS Docker deploys, short interruption risk, SHA identification, backup/rollback steps, and what future ZDD would require. Do not claim rolling/blue-green. | docs/deployment/zero-downtime-limitation.md; production-runbook.md |  | Doc review | True ZDD only with multi-instance LB + expand/contract migrations (out of MVP) |  |

## PHASE 17 — PRODUCTION HARDENING

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 223 | Production Configuration | DONE | DEBUG false guards + compose prod |  |  |  |  |  |
| 224 | Security Hardening | DONE | Throttles, logging, headers/CSP-RO, upload sniffing, DEBUG guards | settings.py; next.config.ts | pytest |  |  |  |
| 225 | Server Hardening | BLOCKED — HUMAN ACTION REQUIRED | App-level security settings exist in Django/Next. OS package hardening/SSH posture requires VPS access. |  |  | Hardening checklist signed off | Apply/verify VPS OS hardening checklist | Majd/ops: SSH into VPS and harden OS |
| 226 | Database Hardening | BLOCKED — HUMAN ACTION REQUIRED | App uses Django ORM/migrations. Postgres network exposure, roles, and backups-on-host require DB/VPS access. |  |  | DB not publicly writable; least-privilege roles | Verify Postgres bind address, roles, and access controls | Majd/ops: harden production Postgres |
| 227 | API Hardening | DONE | Beyond throttles: admin authz matrix (unauth + non-staff) across menu/reservations/hours/settings/news/gallery/inquiries; public GET-only 405 on POST; unpublished news exclusion; predictable 400 bodies without traceback leakage; inquiries 429 behavioral test. Notes in docs/architecture/api-hardening.md. Not a pentest. Current throttles use Django LocMemCache and are per-process, not shared/global. | core/tests/test_api_hardening.py; test_throttle_behavior.py; docs/architecture/api-hardening.md | pytest hardening + throttle | 130 pytest green incl. new tests | Optional later: replace LocMem throttle counters with a shared cache if multi-worker deployment requires shared counters; formal pentest optional. Current throttles use Django LocMemCache and are per-process, not shared/global. |  |
| 228 | Rate Limits | DONE | Scoped rates configured (reservations 30/hour, inquiries 12/hour, auth 20/hour); behavioral 429 tests for auth + reservations scopes. | settings.py; test_throttle_behavior.py | pytest | Throttle unit tests |  |  |
| 229 | Firewall | BLOCKED — HUMAN ACTION REQUIRED | Application listens in Docker as documented. Host firewall (ufw/security groups) is external. |  |  | Port scan matches allowlist | Confirm firewall allows only intended ports | Majd/ops: configure VPS firewall |
| 230 | Monitoring Alerts | BLOCKED — HUMAN ACTION REQUIRED | Health endpoint and optional Sentry stub exist. No pager/alert routing is configured. |  |  | Test alert received on intentional fault | Select alert channel and wire health/Sentry alerts | Majd: choose pager/email/Telegram alert path |
| 231 | Backup Verification | BLOCKED — HUMAN ACTION REQUIRED | Backup script exists (`scripts/backup-postgres.sh`). Successful scheduled backup verification on production is not proven. |  |  | Fresh backup file present; size/timestamp sane | Enable cron backup and confirm artifact exists | Majd/ops: schedule and verify backups on VPS |
| 232 | Restore Test | BLOCKED — HUMAN ACTION REQUIRED | Restore script exists with CONFIRM_RESTORE=YES guard. No successful production restore drill has been executed/evidenced. |  |  | Restored DB serves health/admin checks | Perform controlled restore drill (preferably non-prod clone first) | Majd/ops: run restore drill and record outcome |
| 233 | Disaster Recovery | PARTIAL | Recovery scripts and runbook exist (`scripts/backup-postgres.sh`, `scripts/restore-postgres.sh`, production-runbook § Disaster recovery). A successful production backup/restore drill has NOT been proven (#231/#232 remain human-blocked). Documented procedure ≠ proven recoverability. | docs/deployment/production-runbook.md; scripts/restore-postgres.sh |  | Doc/script review only | Owner-run restore drill on production with evidence | Majd/ops must execute restore drill |
| 234 | Incident Response | PARTIAL | Runbook contains a short SEV1–SEV3 incident procedure stub and escalation note to owner. No named on-call roster, pager tooling, or incident drills are evidenced. | docs/deployment/production-runbook.md |  | Doc review | Named on-call + drill if required for ops maturity | Owner assigns escalation contacts |

## PHASE 18 — ADMIN & OPERATIONS

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 235 | Admin Dashboard QA | PARTIAL | Local AdminShell smoke: unauthenticated redirect to login; authenticated nav landmarks (bokningar/meny/öppettider/inställningar). Backend admin authz already tested. Not complete human/prod staff QA; no production credential E2E. | admin-shell.test.tsx; staff-guide.md | admin-shell.test.tsx | vitest | Credentialed production admin QA |  |
| 236 | Admin Permissions | DONE | Staff-only APIs |  |  |  |  |  |
| 237 | Content Editing | PARTIAL | Partial Next admin coverage |  |  |  |  |  |
| 238 | Menu Editing | DONE | Admin meny |  |  |  |  |  |
| 239 | Reservation Management | DONE | Admin bokningar + notify flags |  |  |  |  |  |
| 240 | Order Management | DONE | N/A |  |  |  |  |  |
| 241 | Customer Management | DONE | N/A — no customer accounts |  |  |  |  |  |
| 242 | Notification Management | DONE | Admin flags + resend management command + admin UI resend endpoint/button | resend_reservation_notifications; AdminReservationResendNotificationsView; admin bokningar | test_notifications.py | pytest | Live VPS delivery still human |  |
| 243 | Analytics Dashboard | DONE | N/A intentional |  |  |  |  |  |
| 244 | Business Reports | DONE | N/A intentional — no commerce/reporting module in reservation-only MVP | docs/product/mvp.md |  |  |  |  |
| 245 | Audit Logs | PARTIAL | Django admin log + notification flags; no SIEM |  |  |  |  |  |

## PHASE 19 — FINAL QA

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 246 | Full Website Audit | DONE | Second-pass matrix audit completed this mission with evidence | docs/PROJECT-COMPLETION-MATRIX.md |  |  |  |  |
| 247 | Full Feature Audit | DONE | Feature audit against mvp.md: brochure + reservations + admin | mvp.md; matrix |  |  |  |  |
| 248 | Full Mobile Audit | BLOCKED — HUMAN ACTION REQUIRED | Responsive layouts exist; full physical mobile audit is not done in this environment. |  |  | Audit notes signed | Complete physical-device mobile audit checklist | Majd/QA: physical mobile audit |
| 249 | Full Browser Audit | NOT DONE | Full browser audit has not been run. Not blocked by external access — simply not executed. No scores or pass claims invented. |  |  |  | Run/document browser audit when prioritized |  |
| 250 | Full SEO Audit | PARTIAL | Code+docs audited; live SERP external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 251 | Full Security Audit | PARTIAL | Internal repository-level security audit document maps AREA→IMPLEMENTATION→TEST→LIMITATION. Explicitly not an independent penetration test / certification. | docs/architecture/security-audit.md | linked pytest modules | Doc + pytest review | Independent pentest / host hardening |  |
| 252 | Full Performance Audit | NOT DONE | Full performance audit (lab PSI/Lighthouse suite) has not been run; no scores invented. Public URL is reachable without owner login, so this is NOT DONE rather than human-blocked. Field CWV remains separate (#118/#299). |  |  |  | Run lab audit when prioritized; field CWV still needs traffic/owner observation |  |
| 253 | Full Accessibility Audit | PARTIAL | Automated findings expanded (axe, contrast, alt, keyboard/focus tests, ARIA review, touch static checks) in docs/accessibility/wcag-automated-findings.md. Manual keyboard/SR/device and WCAG certification **not** claimed. | docs/accessibility/wcag-automated-findings.md; aria-review.md | a11y vitest suites | npm test | Manual AT + device + formal certification if required |  |
| 254 | Full Content Audit | PARTIAL | Claim-safe pass done; owner refine |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 255 | Full Analytics Audit | DONE | Policy: no third-party analytics |  |  |  |  |  |
| 256 | Production Audit | PARTIAL | Public production-check 11/11; NAP Hornsbergs Strand 57 / 087042050 on live homepage; menu/hours/availability/boka/admin login 200. Frontend security headers await Hostinger rebuild of ship SHA (root cause: undeployed config). | production-audit-public.md; frontend-security-headers.md; production-check.sh |  | production-check 11/11 | Hostinger rebuild + post-deploy header curl; VPS/admin/notify as needed | Majd: rebuild frontend from ship SHA |

## PHASE 20 — CLIENT READINESS

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 257 | Client Account Setup | BLOCKED — HUMAN ACTION REQUIRED | Repo cannot create client Hostinger/DNS/email account ownership. |  |  | Client can log into hosting/DNS/email | Create/transfer client accounts and document owners | Majd: create/transfer client accounts |
| 258 | Admin Account Handover | BLOCKED — HUMAN ACTION REQUIRED | Staff auth code exists; production staff users/credentials must be created out-of-band (never commit passwords). |  |  | Staff can sign in to /admin on production | Create staff users and hand over credentials via password manager | Majd: admin account handover |
| 259 | Domain Ownership | BLOCKED — HUMAN ACTION REQUIRED | Domain name is used in config/smoke checks; registrar ownership transfer is external. |  |  | Owner controls registrar account | Confirm/transfer registrar ownership | Majd: domain ownership confirmation |
| 260 | Hosting Ownership | BLOCKED — HUMAN ACTION REQUIRED | Hosting topology documented (Hostinger frontend + VPS API). Billing/ownership is external. |  |  | Owner can access Hostinger + VPS billing | Confirm Hostinger/VPS billing ownership | Majd: hosting ownership confirmation |
| 261 | Google Business Ownership | BLOCKED — HUMAN ACTION REQUIRED | No GBP credentials in repo by design. |  |  | Owner is GBP primary owner | Complete GBP ownership/claim | Business owner: GBP ownership |
| 262 | Google Analytics Ownership | DONE | N/A — GA not used |  |  |  |  |  |
| 263 | Search Console Ownership | BLOCKED — HUMAN ACTION REQUIRED | Sitemap/robots in code; GSC ownership requires owner Google account. |  |  | Owner listed on GSC property | Make owner the GSC property owner | Majd/business owner: GSC ownership |
| 264 | Repository Ownership | BLOCKED — HUMAN ACTION REQUIRED | Code lives in GitHub; org/admin transfer is a GitHub settings action. |  |  | Owner has admin on repo | Transfer/confirm repository ownership/admin | Majd: GitHub ownership/admin |
| 265 | Database Access | BLOCKED — HUMAN ACTION REQUIRED | DB access must remain on VPS; credentials are not in git. |  |  | Access list documented out-of-band | Document who may access production DB and how | Majd: control DB access list |
| 266 | Email Access | BLOCKED — HUMAN ACTION REQUIRED | Email/SMTP configuration is env-driven; mailbox ownership is external. |  |  | Owner can read staff mailbox / SMTP settings | Confirm production mailbox/SMTP ownership | Majd: email access ownership |
| 267 | Third-Party Accounts | BLOCKED — HUMAN ACTION REQUIRED | Telegram/notification integrations are code-ready; bot/token ownership is external. |  |  | Owner controls bot tokens without storing them in git | Inventory and own Telegram bot and related accounts | Majd: third-party account ownership |
| 268 | API Credentials Handover | BLOCKED — HUMAN ACTION REQUIRED | API/Telegram/email secrets are env-based. Handover must be out-of-band. |  |  | Recipient can operate without engineering secrets in chat/git | Hand over credentials via password manager | Majd: API credentials handover |
| 269 | Backup Access | BLOCKED — HUMAN ACTION REQUIRED | Backup scripts exist; backup storage paths/offsite access are on the host. |  |  | Owner can list/download backups | Grant backup storage access to ops owner | Majd: backup access grant |
| 270 | Documentation | DONE | Deploy docs + matrix + final report + handover | docs/deployment/; docs/PROJECT-COMPLETION-MATRIX.md; docs/RIVA-FINAL-PROJECT-COMPLETION-REPORT.md |  |  |  |  |

## PHASE 21 — DOCUMENTATION

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 271 | Technical Documentation | DONE | docs/architecture + api |  |  |  |  |  |
| 272 | Architecture Documentation | DONE | docs/architecture/overview.md |  |  |  |  |  |
| 273 | Database Documentation | DONE | Domain model inventory in docs/architecture/models.md (catalog/reservations/core) — code+migrations remain SoT; ERD tool N/A for MVP. | docs/architecture/models.md |  | Review models.md |  |  |
| 274 | API Documentation | DONE | docs/api + spectacular |  |  |  |  |  |
| 275 | Deployment Documentation | DONE | checklist + runbook |  |  |  |  |  |
| 276 | Environment Documentation | DONE | .env.example + checklist |  |  |  |  |  |
| 277 | Security Documentation | DONE | docs/architecture/security.md |  |  |  |  |  |
| 278 | Admin Documentation | DONE | Expanded real-world staff guide covering Next `/admin` capabilities (login, overview, bokningar, förfrågningar readonly, meny, öppettider, inställningar/`production_ready`) plus Django Admin for news/gallery/modifiers; workflows, common mistakes, escalation. Does not invent missing UI. | docs/admin/staff-guide.md |  | Doc review against admin routes | Screenshots optional |  |
| 279 | Maintenance Documentation | DONE | Maintenance/deploy/restart/rollback covered in production-runbook.md + production-checklist.md. | docs/deployment/production-runbook.md |  | Review runbook |  |  |
| 280 | Troubleshooting Guide | DONE | Dedicated symptom→cause→check→fix→escalation guide for reservations, booking, notifications, menu cache, admin access, media, frontend/API, deploy, DB, backup/restore, inquiries, 429. Human steps remain human. | docs/ops/troubleshooting.md |  | Doc review | Keep updated when architecture changes |  |
| 281 | Backup & Recovery Guide | DONE | Backup/restore scripts documented in runbook + client handover | production-runbook.md; backup/restore scripts |  | Owner cron + restore drill |  |  |
| 282 | Client User Guide | DONE | Client handover guide lists credentials Majd must own + daily ops | docs/deployment/client-handover.md |  |  |  |  |

## PHASE 22 — LAUNCH

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 283 | Pre-Launch Checklist | DONE | docs/deployment/production-checklist.md |  |  |  |  |  |
| 284 | Production Deployment | BLOCKED — HUMAN ACTION REQUIRED | Manual deploy procedure is documented. This agent has not executed a production deploy as launch closure. |  |  | production-check + smoke after deploy | Execute production deploy of agreed SHA when ready | Majd/ops: run production deploy from runbook |
| 285 | DNS Verification | DONE | Public `dig` verification recorded 2026-09-07T01:04:42Z: rivabistro.se A/AAAA + MX/NS/TXT/SOA; www CNAME to Hostinger CDN; api.rivabistro.se A `72.61.137.176`. DNS not modified. Hostinger console still required to *change* records. | docs/deployment/dns-verification.md |  | Re-run dig commands in doc | Console only if DNS changes needed |  |
| 286 | SSL Verification | DONE | Live TLS verification evidenced by `scripts/production-check.sh` openssl certificate checks for frontend and API hosts (Passed in gap-closure production-check run). Does not claim full TLS policy/HSTS edge configuration audit. | scripts/production-check.sh |  | production-check TLS Passed |  |  |
| 287 | Production Database Verification | BLOCKED — HUMAN ACTION REQUIRED | Public API health reports DB ok in production-check. Direct production DB shell/connectivity verification needs VPS credentials. |  |  | Ops notes from VPS DB check | Verify DB from VPS (migrate status, connections) | Majd: VPS DB verification |
| 288 | Production API Verification | BLOCKED — HUMAN ACTION REQUIRED | Public API smoke passes. Authenticated admin API verification needs staff credentials on live host. |  |  | Staff session works against production API | Log in as staff and verify admin API actions on production | Majd: authenticated production API verification |
| 289 | Payment Verification | DONE | N/A |  |  |  |  |  |
| 290 | Reservation Verification | BLOCKED — HUMAN ACTION REQUIRED | Booking code exists but `production_ready` must remain false until capacity is owner-confirmed. Live booking verification requires that business decision. |  |  | Successful live test booking + admin visibility | Confirm capacity; set production_ready; place test reservation | Majd: capacity confirmation then enable booking |
| 291 | Email Verification | BLOCKED — HUMAN ACTION REQUIRED | Email notification code paths exist. Live staff email delivery proof needs VPS SMTP env + inbox access. |  | verify-notifications | Staff inbox receives test notification | Configure SMTP and run verify-notifications / inbox check | Majd: live email verification |
| 292 | Analytics Verification | DONE | N/A policy |  |  |  |  |  |
| 293 | Search Console Verification | BLOCKED — HUMAN ACTION REQUIRED | Cannot verify GSC without owner Google account. |  |  | GSC shows verified property | Complete GSC verification flow | Majd: Search Console verification |
| 294 | Sitemap Submission | BLOCKED — HUMAN ACTION REQUIRED | `/sitemap.xml` is generated by the app. Submission is a Search Console owner action. |  | Submit sitemap | GSC sitemap status OK | Submit sitemap in GSC | Majd: sitemap submission |
| 295 | Robots Verification | DONE | robots.ts present; live robots.txt 200 verified earlier in mission | app/robots.ts |  | curl rivabistro.se/robots.txt |  |  |
| 296 | Indexation Verification | BLOCKED — HUMAN ACTION REQUIRED | Indexation control files exist; actual indexation requires GSC/SERP observation over time. |  |  | Key pages show as indexed | Confirm key URLs indexed | Majd: indexation verification in GSC/SERP |
| 297 | Structured Data Verification | BLOCKED — HUMAN ACTION REQUIRED | Menu/Breadcrumb JSON-LD are implemented and unit-tested. Restaurant sameAs/social publishing remains gated by business.verified=false until owner confirms facts. |  |  | Rich Results / structured-data test after enablement | Owner confirms social/kitchen facts; then set verified and redeploy; validate structured data | Majd: confirm facts before verified=true |
| 298 | Mobile Verification | BLOCKED — HUMAN ACTION REQUIRED | Emulator checks ≠ physical mobile verification for launch sign-off. |  |  | Signed device verification | Physical-device verification pass | Majd/QA: physical mobile verification |
| 299 | Performance Verification | BLOCKED — HUMAN ACTION REQUIRED | No field CWV/PSI scores are claimed in-repo. Lab tools were not run in this correction task. |  |  | Documented measurement (no invented numbers) | Measure production performance (lab and/or field) and record results | Majd: performance verification on live site |
| 300 | Security Verification | PARTIAL | Local Next headers via next.config + middleware; Django API headers live OK. Live frontend lacked headers because main had no headers() until ship commit — requires Hostinger rebuild of this SHA then re-curl. See docs/deployment/frontend-security-headers.md. | next.config.ts; middleware.ts; docs/deployment/frontend-security-headers.md | security-headers.test.ts | vitest + post-deploy curl | Hostinger rebuild this SHA; if still stripped, hPanel custom headers |  |

## PHASE 23 — POST-LAUNCH

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 301 | Launch Monitoring | BLOCKED — HUMAN ACTION REQUIRED | Monitoring stubs/docs exist; launch monitoring is a post-go-live ops activity. |  |  | Launch monitoring log | Watch health/errors/bookings during launch window | Majd/ops: launch monitoring |
| 302 | Error Monitoring | PARTIAL | Sentry stub ready; not live without DSN | settings.py |  | Set SENTRY_DSN |  | BLOCKED — HUMAN ACTION REQUIRED |
| 303 | Performance Monitoring | BLOCKED — HUMAN ACTION REQUIRED | Ongoing performance monitoring requires host dashboards/APM chosen and accessed by owner. |  |  | Owner can view metrics continuously | Enable and review ongoing performance metrics | Majd: Hostinger/VPS/APM monitoring access |
| 304 | Search Console Monitoring | BLOCKED — HUMAN ACTION REQUIRED | GSC monitoring requires verified property access after #189/#293. |  |  | Periodic GSC review notes | Monitor coverage/sitemap/CWV in GSC | Majd: Search Console monitoring |
| 305 | Analytics Monitoring | DONE | N/A policy |  |  |  |  |  |
| 306 | Conversion Monitoring | PARTIAL | MVP analytics policy is first-party-only: no GA/GTM/ad pixels (#186–191). Reservation DB + admin list provide operational booking visibility only — this is NOT conversion monitoring, dashboards, funnels, or analytics attribution. Do not invent analytics IDs. | apps/backend/reservations/; frontend/src/app/admin/bokningar/; docs/product/mvp.md | reservation tests | Policy + admin review | If conversion monitoring is required later, define first-party metrics explicitly; otherwise keep as intentional non-analytics ops visibility |  |
| 307 | Backup Monitoring | BLOCKED — HUMAN ACTION REQUIRED | Backup scripts exist; monitoring that cron actually runs needs VPS access. |  |  | Recent successful backup observed | Confirm cron/job success notifications | Majd: backup monitoring on VPS |
| 308 | Security Monitoring | BLOCKED — HUMAN ACTION REQUIRED | App security headers/logging exist; continuous security monitoring tooling is owner-chosen and external. |  |  | Alert path tested | Select and enable security monitoring/alerts | Majd: security monitoring tooling |
| 309 | Customer Feedback | BLOCKED — HUMAN ACTION REQUIRED | No in-product customer feedback system beyond contact/booking. Feedback process is organizational. |  |  | Process documented and used | Define how customer feedback is collected/triaged | Majd: customer feedback process |
| 310 | Bug Triage | DONE | Concise MVP triage process: severity/priority, reproducibility, security handling, incident vs bug, labels, response expectations, report→triage→fix→verify→close. | docs/ops/bug-triage.md |  | Doc review | Optional: create suggested GitHub labels when convenient. |  |
| 311 | Regression Checks | DONE | CI on PRs |  |  |  |  |  |
| 312 | SEO Monitoring | BLOCKED — HUMAN ACTION REQUIRED | SEO implementation exists; ongoing SEO monitoring follows indexation and GSC access. |  |  | Periodic SEO review notes | Monitor rankings/coverage after launch | Majd: SEO monitoring after indexation |

## PHASE 24 — FINAL HANDOVER

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 313 | Final Acceptance Test | BLOCKED — HUMAN ACTION REQUIRED | Engineering checklist/matrix exists; final acceptance is an owner business decision. |  |  | Signed acceptance | Owner acceptance test against agreed checklist | Majd: final acceptance |
| 314 | Final Bug Fix | DONE | Mission bugfixes landed (a11y, gallery sniff, admin resend, docs) | this PR | pytest+vitest |  |  |  |
| 315 | Final Security Check | PARTIAL | Deterministic final checklist consolidates proven-local controls vs external verification (`docs/architecture/final-security-check.md`). Local pytest/security suites green. External pentest **not** completed and remains optional. | docs/architecture/final-security-check.md | pytest security modules | Checklist + pytest | Optional pentest; live secret/firewall verify |  |
| 316 | Final Backup | BLOCKED — HUMAN ACTION REQUIRED | Backup tooling exists; final pre-launch backup must be taken on production by ops. |  |  | Backup artifact timestamped pre-launch | Take and store final pre-launch backup | Majd/ops: final backup |
| 317 | Final Production Snapshot | BLOCKED — HUMAN ACTION REQUIRED | Provider snapshot is outside the repo; requires VPS/provider console. |  |  | Snapshot visible in provider UI | Create provider snapshot/image | Majd: final production snapshot |
| 318 | Documentation Handover | DONE | Matrix + final report + client handover | docs/ |  |  |  |  |
| 319 | Credentials Handover | BLOCKED — HUMAN ACTION REQUIRED | Credentials must not be committed. Handover is password-manager/out-of-band. |  | Secure channel | Recipient confirms access | Complete credentials handover checklist | Majd: credentials handover |
| 320 | Ownership Transfer | BLOCKED — HUMAN ACTION REQUIRED | Legal/commercial ownership transfer is outside engineering scope. |  |  | Transfer recorded | Complete ownership transfer paperwork | Majd/legal: ownership transfer |
| 321 | Client Training | BLOCKED — HUMAN ACTION REQUIRED | Staff guide/runbook exist as materials; live training session is human-delivered. |  | Walkthrough admin | Training completed notes | Schedule and deliver client training | Delivery team/Majd: client training |
| 322 | Maintenance Plan | DONE | Concrete plan from runbook architecture: weekly/monthly/quarterly cadence; dependency/security patches; backups vs restore drills; deploy; monitoring/log review; cert/DNS; content; QA; ownership. Automated vs human explicitly marked — no false automation claims. | docs/ops/maintenance-plan.md |  | Doc review | Owner installs backup cron if desired; restore drill remains human |  |
| 323 | Support Plan | BLOCKED — HUMAN ACTION REQUIRED | Support process templates may exist in docs; commercial support agreement is external. |  |  | Signed support plan | Agree support plan/SLA commercially | Majd: support plan agreement |
| 324 | Launch Sign-Off | BLOCKED — HUMAN ACTION REQUIRED | Matrix/report track readiness; launch sign-off requires owner go/no-go after remaining blockers clear. |  |  | Written go-live approval | Owner launch sign-off | Majd: launch sign-off |
| 325 | Project Closure | BLOCKED — HUMAN ACTION REQUIRED | Engineering closeout artifacts exist (matrix/report). Project closure waits on remaining human actions. |  |  | Closure recorded | Close project after blockers cleared and sign-off | Majd: project closure |

