# RIVA BISTRO Design System

Production-ready visual identity and component library for the Riva Bistro restaurant website and table-booking flow.

## Brand Tokens

Source of truth: [`frontend/packages/design-tokens/tokens.json`](../../frontend/packages/design-tokens/tokens.json)

| Token | Value | Usage |
|-------|-------|-------|
| `--riva-charcoal-deep` | `#0F1418` | Dark surfaces |
| `--riva-ivory` | `#F4F0E6` | Primary text |
| `--riva-gold` | `#BFA06A` | Accents (restrained) |
| `--riva-teal` | `#5E8B8B` | CTAs, links, success |
| `--riva-error` | `#C45C5C` | Errors |
| `--riva-success` | `#5E8B6E` | Confirmation |

CSS implementation: [`frontend/src/app/globals.css`](../../frontend/src/app/globals.css)

## Typography

- **Display:** Cormorant Garamond — editorial headings (H1–H4)
- **UI:** Source Sans 3 — body, labels, buttons, prices (tabular nums)

## Components

All components live in `frontend/src/components/ui/`:

| Component | Variants |
|-----------|----------|
| Button | default (teal), secondary, gold, outline, ghost, link, destructive, loading |
| Input / Textarea | default, error |
| Card | product, content |
| Badge | available, soldOut, vat |
| Tabs | category navigation |
| Dialog / Sheet | modals, mobile navigation |
| Toast (Sonner) | confirmations, errors |
| Skeleton | loading states |
| StateMessage | empty, error, success, loading |

Menu & brand: `PriceDisplay`, `ProductImage`, `ProductCard`, `ProductDetail`, `ReservationForm`, `WaveDivider`

## Responsive Breakpoints

| Name | Width |
|------|-------|
| Mobile | 375px+ |
| Tablet | 768px+ |
| Desktop | 1280px+ |
| Wide | 1440px+ |

Mobile-first layout. Slide-in sheet for navigation on mobile.

## Pricing

All customer-facing prices show **inkl. moms** (25% VAT). The dish detail page also shows the ex-VAT price and VAT amount for reference.

## Accessibility

- WCAG AA contrast on charcoal/teal/ivory pairings
- Gold focus rings on all interactive elements
- `prefers-reduced-motion` disables animations
- Keyboard navigation for modals, tabs, and mobile navigation

## Figma Handoff

Figma MCP authentication is required to create the Figma file. Code Connect mapping stub: [`frontend/src/components/ui/button.figma.ts`](../../frontend/src/components/ui/button.figma.ts)

Import tokens from `frontend/packages/design-tokens/tokens.json` when building the Figma variable collections.

## Pages

`/` (hem), `/meny`, `/meny/[slug]`, `/boka`, `/om-oss`, `/kontakt`

Online ordering (cart, checkout, order tracking, account) and the commerce admin dashboard have been removed from scope — the site is a restaurant website with table booking only.

## API

Backend menu domain: `apps/backend/catalog/` (public menu endpoints under `/api/v1/menu/`).

Seed menu: `python manage.py seed_menu`
