# RIVA BISTRO Design System

Visual identity for the Riva Bistro restaurant website and table-booking flow.

## Brand Tokens

Source of truth in code: [`frontend/src/app/globals.css`](../../frontend/src/app/globals.css)

Mirror for design tools: [`frontend/packages/design-tokens/tokens.json`](../../frontend/packages/design-tokens/tokens.json)

| Token | Value | Usage |
|-------|-------|-------|
| `--riva-black` | `#050404` | Page background |
| `--riva-surface` | `#0d0b0a` | Alternate sections |
| `--riva-card` | `#120f0e` | Cards, forms |
| `--riva-cream` | `#f5f2e8` | Primary text |
| `--riva-muted` | `#ada89c` | Secondary text |
| `--riva-gold` | `#b8853d` | Accents and primary CTAs |
| `--riva-error` | `#c45c5c` | Errors |
| `--riva-success` | `#5e8b6e` | Confirmation |

## Typography

- **Display:** Playfair Display — headings
- **UI:** DM Sans — body, labels, buttons, prices (tabular nums)

## Components

`frontend/src/components/ui/` — Button (gold primary), Input, Card, Badge, Sheet, Dialog, Toast, Skeleton, StateMessage.

Brand: `HoursStrip`, `CTASection`, `RestaurantInfo`, `RestaurantImage`, `Logo`, `SectionHeading`.

## Pricing

Customer-facing food prices are **inkl. moms at 12%** (Swedish restaurant VAT). Display via `formatPrice`.

## Accessibility

- Gold focus rings
- `prefers-reduced-motion`
- Skip link to `#main-content`
- `lang="sv"`

## Pages

`/`, `/meny`, `/boka`, `/om-oss`, `/galleri`, `/privata-event`, `/kontakt`, `/admin/*`
