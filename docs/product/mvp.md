# Riva Bistro — MVP Product Scope

## Product

Premium Swedish restaurant website + reservation platform for **Riva Bistro**.

Public language: **Swedish**. Visual identity: black, ivory, subtle gold; cinematic luxury.

> **Scope update:** online ordering / commerce (cart, checkout, order tracking, customer accounts) and the commerce admin dashboard have been removed. The product is now a restaurant website (home, menu display, about, contact, FAQ) plus table booking.

## MVP capabilities (by phase)

### Phase 1 — Foundation (current)

- Monorepo layout
- Docker Compose (Postgres, Django, Next.js)
- Health endpoints
- OpenAPI scaffolding
- Frontend design-system foundation
- Developer documentation

### Phase 2 — Reservation engine

- Domain models + migrations
- Availability engine
- Opening hours / special closures / capacity
- Reservation create API with final availability check
- Heavy unit/API tests

### Phase 3 — Booking UI + typed client

- Generated OpenAPI TypeScript client
- Public booking flow wired to real API

### Phase 4 — Content management (menu, gallery, news)

- Auth / roles
- Menu, gallery, news, settings management

> Online ordering and the commerce dashboard (cart, checkout, order tracking, inventory, sales) are out of scope and have been removed.

### Phase 5 — Media + Telegram

- S3-compatible storage abstraction
- Image validation/optimization pipeline
- Async Telegram notifications with delivery state

### Phase 6 — Public website polish

- Cinematic homepage and content pages
- Accessibility, responsive polish, SEO

### Phase 7 — Hardening

- e2e tests, production Docker, security review, final docs

## Non-goals for Phase 1

- Real reservation booking
- Admin CMS screens
- Telegram
- Production CDN
- Hardcoded menu/news content in React
