# Riva Bistro — MVP Product Scope

## Product

Premium Swedish restaurant website + reservation platform for **Riva Bistro**.

Public language: **Swedish**. Visual identity: black, ivory, subtle gold; cinematic luxury.

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

### Phase 4 — Admin CMS & commerce

- Auth / roles
- Menu, gallery, news, settings management
- **Online ordering:** cart, checkout, order tracking (implemented)
- **Restaurant dashboard:** orders, products, inventory, sales KPIs

### Phase 4b — Commerce hardening

- Stripe payment integration (stub payment in place)
- Real-time order status (WebSocket/polling)
- Inventory sync on order

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
