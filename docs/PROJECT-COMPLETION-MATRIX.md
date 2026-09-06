# Riva Bistro — Project Completion Matrix

Evidence-based status for the 325-item production readiness checklist.
Product scope: **brochure site + table reservations** (commerce intentionally out of scope per `docs/product/mvp.md`).

## Dependency map

1. Security & configuration → 2. Reservations & notifications → 3. Menu CMS → 4. SEO/content → 5. Legal scaffolding → 6. Ops/backups → 7. Live launch verification (human)

## Summary (post-implementation second pass)

| Status | Count |
|--------|------:|
| DONE | 163 |
| PARTIAL | 91 |
| NOT DONE | 4 |
| BLOCKED — HUMAN ACTION REQUIRED | 67 |
| **Total** | **325** |

Completion percentage (DONE only): **50.2%**

Evidence from this mission: backend pytest 103 passed; frontend vitest 45 passed; `tsc --noEmit` OK; `scripts/production-check.sh` 11/11 live checks OK; local legal routes verified in repo.

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
| 33 | Product Details | PARTIAL | Slug route redirects to category hash (no dedicated PDP SEO) | meny/[slug] |  |  | Optional dedicated dish pages |  |
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
| 45 | Content Management | PARTIAL | Menu/hours/reservations in Next admin; gallery/news leaner via Django | admin pages |  |  | Gallery/news Next admin polish |  |
| 46 | Menu Management | DONE | Admin meny CRUD | admin/meny |  |  |  |  |
| 47 | Category Management | DONE | Section admin + seed commands | catalog/ |  |  |  |  |
| 48 | Product Management | DONE | Product admin API |  |  |  |  |  |
| 49 | Pricing Management | DONE | Product price fields in CMS |  |  |  |  |  |
| 50 | Image Management | PARTIAL | Product/gallery images via media; local disk not S3 | MEDIA settings |  |  | S3 optional later |  |
| 51 | Opening Hours Management | DONE | Admin öppettider + API | reservations OpeningHours |  |  |  |  |
| 52 | Restaurant Information Management | PARTIAL | business.ts + ReservationSettings; not full CMS for NAP | business.ts |  |  | Owner confirms verified=true | BLOCKED — HUMAN ACTION REQUIRED |
| 53 | Contact Management | DONE | Contact inquiry API + admin inbox |  |  |  |  |  |
| 54 | Reservation System | DONE | Availability + create with locks | reservations/ |  | reservation tests |  |  |
| 55 | Reservation Management | DONE | Admin bokningar list/detail |  |  |  |  |  |
| 56 | Order System | DONE | N/A — commerce out of scope per mvp.md | docs/product/mvp.md |  |  |  |  |
| 57 | Cart System | DONE | N/A — commerce out of scope |  |  |  |  |  |
| 58 | Checkout | DONE | N/A — commerce out of scope |  |  |  |  |  |
| 59 | Payment Integration | DONE | N/A — no payments; do not invent Stripe |  |  |  |  |  |
| 60 | Receipt System | DONE | N/A — no payments |  |  |  |  |  |
| 61 | Notification System | PARTIAL | Telegram+email best-effort with flags/resend; VPS delivery unproven | core/notifications/; resend command | test_notifications.py | verify-notifications.sh on VPS | Confirm live delivery | BLOCKED — HUMAN ACTION REQUIRED |

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
| 93 | Heading Structure | PARTIAL | Pages use h1; spot-check ongoing |  |  | Full heading audit |  |  |
| 94 | Canonical URLs | DONE | createPageMetadata alternates.canonical | seo.ts |  |  |  |  |
| 95 | Robots.txt | DONE | app/robots.ts disallows /admin |  |  |  |  |  |
| 96 | XML Sitemap | DONE | app/sitemap.ts public routes |  |  |  |  |  |
| 97 | Image SEO | PARTIAL | alt text on many images; incomplete inventory |  |  | Full alt audit |  |  |
| 98 | Internal Linking | DONE | Header/footer/CTAs |  |  |  |  |  |
| 99 | Structured Data | PARTIAL | RestaurantJsonLd gated by business.verified=false | json-ld.tsx; business.ts |  |  | Owner sets verified=true | BLOCKED — HUMAN ACTION REQUIRED |
| 100 | Local SEO | PARTIAL | NAP consistent in code; GBP external | business.ts; nap-consistency.md |  |  | GBP ownership | BLOCKED — HUMAN ACTION REQUIRED |
| 101 | NAP Consistency | DONE | Hornsbergs Strand 57 everywhere in code; Strandvägen scrubbed | business.ts; docs/seo/nap-consistency.md |  |  |  |  |
| 102 | Open Graph | DONE | OG in createPageMetadata |  |  |  |  |  |
| 103 | Twitter/X Cards | DONE | Twitter cards in createPageMetadata |  |  |  |  |  |
| 104 | Breadcrumbs | PARTIAL | Not systematically implemented |  |  | Add where useful |  |  |
| 105 | Indexation Control | DONE | robots + admin noindex |  |  |  |  |  |

## PHASE 8 — LOCAL BUSINESS

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 106 | Google Business Profile | BLOCKED — HUMAN ACTION REQUIRED | External owner account |  |  | Claim/verify GBP | Majd: GBP access |  |
| 107 | Business Information | PARTIAL | business.ts filled; verified=false | business.ts |  |  | Confirm social/kitchen | BLOCKED — HUMAN ACTION REQUIRED |
| 108 | Opening Hours | DONE | API + official_hours seed |  |  |  |  |  |
| 109 | Holiday Hours | DONE | SpecialClosure model + admin |  |  |  |  |  |
| 110 | Location Data | DONE | Address + map URL Hornsbergs Strand 57 |  |  |  |  |  |
| 111 | Contact Data | DONE | Phone 087042050 + email in business.ts |  |  |  |  |  |
| 112 | Google Maps Integration | DONE | Map link/iframe on kontakt |  |  |  |  |  |
| 113 | LocalBusiness Schema | PARTIAL | Implemented but gated off until verified |  |  | Enable after verify | BLOCKED — HUMAN ACTION REQUIRED |  |
| 114 | Restaurant Schema | PARTIAL | Same as JSON-LD gate |  |  | Enable after verify | BLOCKED — HUMAN ACTION REQUIRED |  |
| 115 | Menu Schema | PARTIAL | Not fully emitted as Menu structured data |  |  | Optional Menu schema |  |  |
| 116 | Review Strategy | BLOCKED — HUMAN ACTION REQUIRED | No fake reviews; use GBP |  |  | GBP review process | Majd |  |

## PHASE 9 — PERFORMANCE

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 117 | Performance Audit | PARTIAL | No formal Lighthouse CI evidence yet |  |  | Run Lighthouse on prod | BLOCKED — HUMAN ACTION REQUIRED |  |
| 118 | Core Web Vitals | BLOCKED — HUMAN ACTION REQUIRED | Cannot claim without field data |  |  | CrUX/PSI on prod | Majd/host |  |
| 119 | Image Optimization | PARTIAL | next/image used; inventory incomplete |  |  |  |  |  |
| 120 | Image Formats | PARTIAL | Depends on sources; WebP via next/image where possible |  |  |  |  |  |
| 121 | Lazy Loading | DONE | next/image default lazy for non-priority |  |  |  |  |  |
| 122 | Code Splitting | DONE | Next App Router automatic splitting |  |  |  |  |  |
| 123 | Caching | PARTIAL | ISR revalidate on meny; no CDN config in repo |  |  |  |  |  |
| 124 | CDN | BLOCKED — HUMAN ACTION REQUIRED | Hostinger/CDN outside repo |  |  | Confirm CDN | Majd |  |
| 125 | Font Optimization | DONE | next/font/local with display swap |  |  |  |  |  |
| 126 | JavaScript Optimization | PARTIAL | No bundle analysis in CI |  |  | optional analyze |  |  |
| 127 | CSS Optimization | DONE | Tailwind purged build |  |  |  |  |  |
| 128 | Server Optimization | PARTIAL | gunicorn in prod compose; nginx external |  |  |  |  |  |
| 129 | Database Optimization | PARTIAL | Indexes on sort_order; no full query audit |  |  |  |  |  |
| 130 | API Optimization | PARTIAL | Select-related where needed; ongoing |  |  |  |  |  |

## PHASE 10 — MOBILE & RESPONSIVE

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 131 | Mobile Layout | PARTIAL | Responsive Tailwind; emulator only |  |  | Physical devices | BLOCKED — HUMAN ACTION REQUIRED |  |
| 132 | Tablet Layout | PARTIAL | Same |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 133 | Desktop Layout | DONE | Designed desktop-first cinematic |  |  |  |  |  |
| 134 | Touch Optimization | PARTIAL | Buttons sized; no formal touch audit |  |  |  |  |  |
| 135 | Mobile Navigation | DONE | Sheet/menu for mobile nav |  |  |  |  |  |
| 136 | Mobile Forms | PARTIAL | Booking form responsive |  |  | Device QA | BLOCKED — HUMAN ACTION REQUIRED |  |
| 137 | Mobile Checkout | DONE | N/A — no checkout |  |  |  |  |  |
| 138 | Mobile Performance | BLOCKED — HUMAN ACTION REQUIRED | Needs field measurement |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 139 | Cross-Browser Compatibility | PARTIAL | Modern browsers assumed; no matrix run |  |  | Browser matrix | BLOCKED — HUMAN ACTION REQUIRED |  |
| 140 | Device Testing | BLOCKED — HUMAN ACTION REQUIRED | No physical device lab in this environment |  |  | Majd device QA | Majd |  |

## PHASE 11 — ACCESSIBILITY

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 141 | WCAG Audit | PARTIAL | Foundations present; no full WCAG report |  |  | Formal audit |  |  |
| 142 | Keyboard Navigation | PARTIAL | Focus rings; full path not exhaustively tested |  |  |  |  |  |
| 143 | Screen Reader Support | PARTIAL | Semantic HTML + labels; SR testing limited |  |  |  |  |  |
| 144 | Focus Management | PARTIAL | focus-visible global; dialogs use Radix |  |  |  |  |  |
| 145 | Color Contrast | PARTIAL | Cream on black intentional; gold accents need spot-check |  |  |  |  |  |
| 146 | Alt Text | PARTIAL | Many images have alt; inventory incomplete |  |  |  |  |  |
| 147 | Form Accessibility | DONE | Reservation + contact + event forms: labels, aria-invalid, aria-describedby, role=alert | reservation-form; contact-form; event-inquiry-form |  | Keyboard + SR spot-check |  |  |
| 148 | Semantic HTML | DONE | header/main/footer/nav/address |  |  |  |  |  |
| 149 | ARIA | PARTIAL | Used sparingly with Radix; avoid over-ARIA |  |  |  |  |  |
| 150 | Reduced Motion | DONE | prefers-reduced-motion in CSS + reveal observer |  |  |  |  |  |

## PHASE 12 — TESTING

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 151 | Unit Testing | DONE | pytest + vitest in CI |  | ci.yml |  |  |  |
| 152 | Integration Testing | DONE | API reservation/notification tests |  | pytest |  |  |  |
| 153 | API Testing | DONE | DRF tests for menu/reservations/auth |  |  |  |  |  |
| 154 | End-to-End Testing | NOT DONE | No Playwright/Cypress yet |  |  | Add smoke e2e optional |  |  |
| 155 | UI Testing | PARTIAL | Component unit tests limited |  |  |  |  |  |
| 156 | Form Testing | PARTIAL | Booking API tested; UI form partial |  |  |  |  |  |
| 157 | Authentication Testing | DONE | Admin auth tests exist |  |  |  |  |  |
| 158 | Authorization Testing | DONE | Admin permission checks in tests |  |  |  |  |  |
| 159 | Payment Testing | DONE | N/A |  |  |  |  |  |
| 160 | Reservation Testing | DONE | Availability/booking/notification suites |  |  |  |  |  |
| 161 | Mobile Testing | BLOCKED — HUMAN ACTION REQUIRED | Physical devices unavailable |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 162 | Browser Testing | BLOCKED — HUMAN ACTION REQUIRED | Full matrix not run here |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 163 | Accessibility Testing | PARTIAL | Manual/partial; no axe CI |  |  |  |  |  |
| 164 | SEO Testing | PARTIAL | seo.test.ts unit tests; no live SERP |  | seo.test.ts |  |  |  |
| 165 | Performance Testing | NOT DONE | No Lighthouse CI |  |  |  |  |  |
| 166 | Security Testing | PARTIAL | Throttle/auth tests; no pentest |  |  |  |  |  |
| 167 | Error Handling Testing | PARTIAL | API error codes tested; UI error states partial |  |  |  |  |  |
| 168 | Edge Case Testing | PARTIAL | Booking edge cases covered in backend tests |  |  |  |  |  |
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
| 189 | Search Console | BLOCKED — HUMAN ACTION REQUIRED | External verification |  |  | Verify property | Majd |  |
| 190 | Conversion Tracking | DONE | N/A without third-party analytics; booking success is first-party UI state |  |  |  |  |  |
| 191 | Event Tracking | DONE | Policy: no third-party event pixels |  |  |  |  |  |
| 192 | Reservation Tracking | PARTIAL | Server-side reservations in DB; no GA events |  |  |  |  |  |
| 193 | Order Tracking | DONE | N/A — no orders |  |  |  |  |  |
| 194 | Payment Tracking | DONE | N/A — no payments |  |  |  |  |  |
| 195 | Error Monitoring | PARTIAL | Env-gated Sentry init when SENTRY_DSN set; empty = no-op | settings.py; .env.example |  | Owner sets DSN + installs sentry-sdk | Live DSN | BLOCKED — HUMAN ACTION REQUIRED |
| 196 | Performance Monitoring | BLOCKED — HUMAN ACTION REQUIRED | No APM; Hostinger/VPS metrics external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |

## PHASE 15 — INFRASTRUCTURE

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 197 | Domain | BLOCKED — HUMAN ACTION REQUIRED | rivabistro.se assumed; ownership external |  |  | Confirm DNS ownership | Majd |  |
| 198 | DNS | BLOCKED — HUMAN ACTION REQUIRED | Hostinger DNS outside repo |  |  | Verify records | Majd |  |
| 199 | SSL | BLOCKED — HUMAN ACTION REQUIRED | TLS at proxy; verify live certs |  |  | production-check.sh | Majd |  |
| 200 | Hosting | DONE | Hostinger frontend + VPS API documented | docs/deployment/ |  |  |  |  |
| 201 | Production Server | PARTIAL | docker-compose.production.yml; live verify external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 202 | Database Server | PARTIAL | Postgres on VPS; access external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 203 | Environment Variables | DONE | .env.example documents keys |  |  |  |  |  |
| 204 | Production Secrets | BLOCKED — HUMAN ACTION REQUIRED | Must exist only on hosts |  |  | Rotate/confirm secrets | Majd |  |
| 205 | Email Configuration | PARTIAL | Code ready; VPS env unproven |  | verify-notifications | Confirm delivery | BLOCKED — HUMAN ACTION REQUIRED |  |
| 206 | Storage Configuration | PARTIAL | Local MEDIA_ROOT; S3 future |  |  |  |  |  |
| 207 | CDN Configuration | BLOCKED — HUMAN ACTION REQUIRED | External |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 208 | Backup Configuration | PARTIAL | Backup scripts present; schedule/retention on VPS pending | scripts/backup-postgres.sh |  | Cron on VPS |  | BLOCKED — HUMAN ACTION REQUIRED |
| 209 | Monitoring Configuration | PARTIAL | Health endpoint + optional Sentry; no pager | health; SENTRY_DSN | production-check |  | Alerts external |  |
| 210 | Logging Configuration | DONE | Django LOGGING dict with console handlers; no secrets in formatters | config/settings.py | pytest |  |  |  |

## PHASE 16 — CI/CD & DEPLOYMENT

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 211 | Git Workflow | DONE | Feature branches + PRs |  |  |  |  |  |
| 212 | Branch Protection | BLOCKED — HUMAN ACTION REQUIRED | GitHub settings external |  |  | Enable protection rules | Majd |  |
| 213 | Code Review | PARTIAL | PR workflow; enforcement external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 214 | CI Pipeline | DONE | .github/workflows/ci.yml lint/test |  |  |  |  |  |
| 215 | Automated Tests | DONE | pytest + vitest in CI |  |  |  |  |  |
| 216 | Build Pipeline | DONE | CI runs npm run build (production Next build) | .github/workflows/ci.yml | CI |  |  |  |
| 217 | Deployment Pipeline | NOT DONE | Manual deploy per runbook; no CD |  |  | Optional CD later |  |  |
| 218 | Staging Environment | NOT DONE | No dedicated staging |  |  | Optional |  |  |
| 219 | Production Environment | PARTIAL | Documented; live access external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 220 | Database Migration Deployment | DONE | entrypoint migrate; runbook |  |  |  |  |  |
| 221 | Rollback Strategy | DONE | Documented in runbook |  |  |  |  |  |
| 222 | Zero-Downtime Deployment | PARTIAL | Not guaranteed; documented limitation |  |  | Accept or improve |  |  |

## PHASE 17 — PRODUCTION HARDENING

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 223 | Production Configuration | DONE | DEBUG false guards + compose prod |  |  |  |  |  |
| 224 | Security Hardening | DONE | Throttles, logging, headers/CSP-RO, upload sniffing, DEBUG guards | settings.py; next.config.ts | pytest |  |  |  |
| 225 | Server Hardening | BLOCKED — HUMAN ACTION REQUIRED | VPS OS hardening external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 226 | Database Hardening | BLOCKED — HUMAN ACTION REQUIRED | Postgres roles/network external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 227 | API Hardening | PARTIAL | Throttles on writes; public reads open by design |  |  |  |  |  |
| 228 | Rate Limits | PARTIAL | Scoped rates configured |  |  |  |  |  |
| 229 | Firewall | BLOCKED — HUMAN ACTION REQUIRED | VPS firewall external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 230 | Monitoring Alerts | BLOCKED — HUMAN ACTION REQUIRED | No pager/alerts configured |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 231 | Backup Verification | BLOCKED — HUMAN ACTION REQUIRED | No proven restore yet |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 232 | Restore Test | BLOCKED — HUMAN ACTION REQUIRED | Requires prod DB access |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 233 | Disaster Recovery | PARTIAL | Runbook partial |  |  | Expand DR doc |  |  |
| 234 | Incident Response | PARTIAL | Runbook troubleshooting only |  |  |  |  |  |

## PHASE 18 — ADMIN & OPERATIONS

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 235 | Admin Dashboard QA | PARTIAL | UI exists; full QA ongoing |  |  |  |  |  |
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
| 248 | Full Mobile Audit | BLOCKED — HUMAN ACTION REQUIRED | Physical devices |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 249 | Full Browser Audit | BLOCKED — HUMAN ACTION REQUIRED | Matrix not run |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 250 | Full SEO Audit | PARTIAL | Code+docs audited; live SERP external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 251 | Full Security Audit | PARTIAL | Code audit; no external pentest |  |  |  |  |  |
| 252 | Full Performance Audit | BLOCKED — HUMAN ACTION REQUIRED | Needs prod PSI |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 253 | Full Accessibility Audit | PARTIAL | Partial |  |  |  |  |  |
| 254 | Full Content Audit | PARTIAL | Claim-safe pass done; owner refine |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 255 | Full Analytics Audit | DONE | Policy: no third-party analytics |  |  |  |  |  |
| 256 | Production Audit | BLOCKED — HUMAN ACTION REQUIRED | Needs live host access |  | production-check.sh |  | BLOCKED — HUMAN ACTION REQUIRED |  |

## PHASE 20 — CLIENT READINESS

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 257 | Client Account Setup | BLOCKED — HUMAN ACTION REQUIRED |  |  |  | Majd accounts | Majd |  |
| 258 | Admin Account Handover | BLOCKED — HUMAN ACTION REQUIRED |  |  |  | Provide admin creds via secure channel | Majd |  |
| 259 | Domain Ownership | BLOCKED — HUMAN ACTION REQUIRED |  |  |  | Confirm registrar | Majd |  |
| 260 | Hosting Ownership | BLOCKED — HUMAN ACTION REQUIRED |  |  |  | Hostinger+VPS access | Majd |  |
| 261 | Google Business Ownership | BLOCKED — HUMAN ACTION REQUIRED |  |  |  | GBP | Majd |  |
| 262 | Google Analytics Ownership | DONE | N/A — GA not used |  |  |  |  |  |
| 263 | Search Console Ownership | BLOCKED — HUMAN ACTION REQUIRED |  |  |  | GSC | Majd |  |
| 264 | Repository Ownership | BLOCKED — HUMAN ACTION REQUIRED |  |  |  | GitHub org/access | Majd |  |
| 265 | Database Access | BLOCKED — HUMAN ACTION REQUIRED |  |  |  | VPS postgres | Majd |  |
| 266 | Email Access | BLOCKED — HUMAN ACTION REQUIRED |  |  |  | Mailbox | Majd |  |
| 267 | Third-Party Accounts | BLOCKED — HUMAN ACTION REQUIRED | Telegram bot etc. |  |  |  | Majd |  |
| 268 | API Credentials Handover | BLOCKED — HUMAN ACTION REQUIRED |  |  |  | Env secrets list | Majd |  |
| 269 | Backup Access | BLOCKED — HUMAN ACTION REQUIRED |  |  |  | Backup storage | Majd |  |
| 270 | Documentation | DONE | Deploy docs + matrix + final report + handover | docs/deployment/; docs/PROJECT-COMPLETION-MATRIX.md; docs/RIVA-FINAL-PROJECT-COMPLETION-REPORT.md |  |  |  |  |

## PHASE 21 — DOCUMENTATION

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 271 | Technical Documentation | DONE | docs/architecture + api |  |  |  |  |  |
| 272 | Architecture Documentation | DONE | docs/architecture/overview.md |  |  |  |  |  |
| 273 | Database Documentation | PARTIAL | Models as code; no separate ERD |  |  | Optional ERD |  |  |
| 274 | API Documentation | DONE | docs/api + spectacular |  |  |  |  |  |
| 275 | Deployment Documentation | DONE | checklist + runbook |  |  |  |  |  |
| 276 | Environment Documentation | DONE | .env.example + checklist |  |  |  |  |  |
| 277 | Security Documentation | DONE | docs/architecture/security.md |  |  |  |  |  |
| 278 | Admin Documentation | PARTIAL | Partial in runbook |  |  | Client user guide |  |  |
| 279 | Maintenance Documentation | PARTIAL | Runbook |  |  |  |  |  |
| 280 | Troubleshooting Guide | PARTIAL | Runbook sections |  |  |  |  |  |
| 281 | Backup & Recovery Guide | DONE | Backup/restore scripts documented in runbook + client handover | production-runbook.md; backup/restore scripts |  | Owner cron + restore drill |  |  |
| 282 | Client User Guide | DONE | Client handover guide lists credentials Majd must own + daily ops | docs/deployment/client-handover.md |  |  |  |  |

## PHASE 22 — LAUNCH

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 283 | Pre-Launch Checklist | DONE | docs/deployment/production-checklist.md |  |  |  |  |  |
| 284 | Production Deployment | BLOCKED — HUMAN ACTION REQUIRED | Manual; not executed by agent |  |  | Deploy when ready | Majd |  |
| 285 | DNS Verification | BLOCKED — HUMAN ACTION REQUIRED |  |  |  |  | Majd |  |
| 286 | SSL Verification | BLOCKED — HUMAN ACTION REQUIRED |  |  | production-check |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 287 | Production Database Verification | BLOCKED — HUMAN ACTION REQUIRED |  |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 288 | Production API Verification | BLOCKED — HUMAN ACTION REQUIRED |  |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 289 | Payment Verification | DONE | N/A |  |  |  |  |  |
| 290 | Reservation Verification | BLOCKED — HUMAN ACTION REQUIRED | Needs production_ready + live test booking |  |  | Enable + test | Majd |  |
| 291 | Email Verification | BLOCKED — HUMAN ACTION REQUIRED |  |  | verify-notifications |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 292 | Analytics Verification | DONE | N/A policy |  |  |  |  |  |
| 293 | Search Console Verification | BLOCKED — HUMAN ACTION REQUIRED |  |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 294 | Sitemap Submission | BLOCKED — HUMAN ACTION REQUIRED |  |  | Submit sitemap | Majd |  |  |
| 295 | Robots Verification | DONE | robots.ts present; live robots.txt 200 verified earlier in mission | app/robots.ts |  | curl rivabistro.se/robots.txt |  |  |
| 296 | Indexation Verification | BLOCKED — HUMAN ACTION REQUIRED |  |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 297 | Structured Data Verification | BLOCKED — HUMAN ACTION REQUIRED | Gated until verified=true |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 298 | Mobile Verification | BLOCKED — HUMAN ACTION REQUIRED |  |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 299 | Performance Verification | BLOCKED — HUMAN ACTION REQUIRED |  |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 300 | Security Verification | PARTIAL | Code-level headers verified; live frontend may strip Next headers until redeploy | next.config.ts; settings.py | production-check TLS | Post-deploy header check | Hostinger header pass-through |  |

## PHASE 23 — POST-LAUNCH

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 301 | Launch Monitoring | BLOCKED — HUMAN ACTION REQUIRED | After launch |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 302 | Error Monitoring | PARTIAL | Sentry stub ready; not live without DSN | settings.py |  | Set SENTRY_DSN |  | BLOCKED — HUMAN ACTION REQUIRED |
| 303 | Performance Monitoring | BLOCKED — HUMAN ACTION REQUIRED |  |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 304 | Search Console Monitoring | BLOCKED — HUMAN ACTION REQUIRED |  |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 305 | Analytics Monitoring | DONE | N/A policy |  |  |  |  |  |
| 306 | Conversion Monitoring | PARTIAL | DB reservations as source of truth |  |  |  |  |  |
| 307 | Backup Monitoring | BLOCKED — HUMAN ACTION REQUIRED |  |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 308 | Security Monitoring | BLOCKED — HUMAN ACTION REQUIRED |  |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 309 | Customer Feedback | BLOCKED — HUMAN ACTION REQUIRED | Process external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 310 | Bug Triage | PARTIAL | GitHub issues assumed |  |  |  |  |  |
| 311 | Regression Checks | DONE | CI on PRs |  |  |  |  |  |
| 312 | SEO Monitoring | BLOCKED — HUMAN ACTION REQUIRED | After indexation |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |

## PHASE 24 — FINAL HANDOVER

| # | Requirement | Status | Evidence | Files | Tests | Verification | Remaining | Human |
|--:|-------------|--------|----------|-------|-------|--------------|-----------|-------|
| 313 | Final Acceptance Test | BLOCKED — HUMAN ACTION REQUIRED | Owner acceptance |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 314 | Final Bug Fix | DONE | Mission bugfixes landed (a11y, gallery sniff, admin resend, docs) | this PR | pytest+vitest |  |  |  |
| 315 | Final Security Check | PARTIAL | Code security pass + tests; no external pentest |  | pytest security |  | Pentest optional |  |
| 316 | Final Backup | BLOCKED — HUMAN ACTION REQUIRED |  |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 317 | Final Production Snapshot | BLOCKED — HUMAN ACTION REQUIRED |  |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 318 | Documentation Handover | DONE | Matrix + final report + client handover | docs/ |  |  |  |  |
| 319 | Credentials Handover | BLOCKED — HUMAN ACTION REQUIRED |  |  | Secure channel | Majd |  |  |
| 320 | Ownership Transfer | BLOCKED — HUMAN ACTION REQUIRED |  |  |  | Majd |  |  |
| 321 | Client Training | BLOCKED — HUMAN ACTION REQUIRED |  |  | Walkthrough admin | Majd |  |  |
| 322 | Maintenance Plan | PARTIAL | Runbook basis |  |  |  |  |  |
| 323 | Support Plan | BLOCKED — HUMAN ACTION REQUIRED | Commercial agreement external |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |
| 324 | Launch Sign-Off | BLOCKED — HUMAN ACTION REQUIRED |  |  |  | Majd |  |  |
| 325 | Project Closure | BLOCKED — HUMAN ACTION REQUIRED | After human actions |  |  |  | BLOCKED — HUMAN ACTION REQUIRED |  |

