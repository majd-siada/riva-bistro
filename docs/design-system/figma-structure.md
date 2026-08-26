# Figma File Structure — RIVA BISTRO

Use this guide when creating the Figma design system after MCP authentication.

## Pages (in order)

1. **Brand** — Mood board, voice/tone, photography direction
2. **Logo** — Emblem variants from `/apps/web/public/brand/riva-logo.png`
3. **Colors** — Import from `packages/design-tokens/tokens.json`
4. **Typography** — Cormorant Garamond + Source Sans 3 scales
5. **Foundations** — Spacing (4px grid), breakpoints, radius, motion
6. **Components** — Mirror `apps/web/src/components/ui/*`
7. **Patterns** — Product card, cart line, order timeline, KPI row, pricing block
8. **Desktop** — 1280px customer + dashboard screens
9. **Mobile** — 375px customer + dashboard screens
10. **Customer Dashboard** — Account, order history, order detail
11. **Restaurant Dashboard** — Admin screens matching `/admin/*` routes
12. **Prototype** — Flows documented in design-system README

## Code Connect

Stub: `apps/web/src/components/ui/button.figma.ts`

Connect each Figma component to its React counterpart after the Figma file is created.

## Token Import

```json
{
  "charcoalDeep": "#0F1418",
  "ivory": "#F4F0E6",
  "gold": "#BFA06A",
  "teal": "#5E8B8B",
  "tealMuted": "#4A7373",
  "error": "#C45C5C",
  "success": "#5E8B6E"
}
```
