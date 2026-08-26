# RIVA BISTRO Design System

Production-ready visual identity and component library for the Riva Bistro customer storefront and restaurant dashboard.

## Brand Tokens

Source of truth: [`packages/design-tokens/tokens.json`](../../packages/design-tokens/tokens.json)

| Token | Value | Usage |
|-------|-------|-------|
| `--riva-charcoal-deep` | `#0F1418` | Dark surfaces |
| `--riva-ivory` | `#F4F0E6` | Primary text |
| `--riva-gold` | `#BFA06A` | Accents (restrained) |
| `--riva-teal` | `#5E8B8B` | CTAs, links, success |
| `--riva-error` | `#C45C5C` | Errors |
| `--riva-success` | `#5E8B6E` | Confirmation |

CSS implementation: [`apps/web/src/app/globals.css`](../../apps/web/src/app/globals.css)

## Typography

- **Display:** Cormorant Garamond — editorial headings (H1–H4)
- **UI:** Source Sans 3 — body, labels, buttons, prices (tabular nums)

## Components

All components live in `apps/web/src/components/ui/`:

| Component | Variants |
|-----------|----------|
| Button | default (teal), secondary, gold, outline, ghost, link, destructive, loading |
| Input / Textarea | default, error |
| Card | product, order, KPI |
| Badge | available, soldOut, preparing, delivered, vat |
| Tabs | category navigation |
| Dialog / Sheet | modals, cart drawer |
| Toast (Sonner) | cart add, order placed, errors |
| Skeleton | loading states |
| StateMessage | empty, error, success, loading |

Commerce-specific: `PriceDisplay`, `ProductImage`, `ProductCard`, `OrderStatusTimeline`, `WaveDivider`

## Responsive Breakpoints

| Name | Width |
|------|-------|
| Mobile | 375px+ |
| Tablet | 768px+ |
| Desktop | 1280px+ |
| Wide | 1440px+ |

Mobile-first layout. Cart drawer on mobile, full cart page on desktop.

## Pricing

All customer-facing prices show **inkl. moms** (25% VAT). Checkout displays ex-VAT subtotal, VAT amount, and total.

## Accessibility

- WCAG AA contrast on charcoal/teal/ivory pairings
- Gold focus rings on all interactive elements
- `prefers-reduced-motion` disables animations
- Keyboard navigation for cart drawer, modals, tabs

## Figma Handoff

Figma MCP authentication is required to create the Figma file. Code Connect mapping stub: [`apps/web/src/components/ui/button.figma.ts`](../../apps/web/src/components/ui/button.figma.ts)

Import tokens from `packages/design-tokens/tokens.json` when building the Figma variable collections.

## Pages

### Customer
`/`, `/meny`, `/meny/[slug]`, `/varukorg`, `/kassa`, `/order/[ref]`, `/konto`, `/konto/ordrar/[id]`, `/om-oss`, `/kontakt`, `/faq`

### Dashboard
`/admin`, `/admin/ordrar`, `/admin/produkter`, `/admin/kategorier`, `/admin/lager`, `/admin/kunder`, `/admin/forsaljning`, `/admin/installningar`

## API

Backend commerce domain: `apps/backend/catalog/`, `apps/backend/commerce/`

Seed menu: `python manage.py seed_menu`
