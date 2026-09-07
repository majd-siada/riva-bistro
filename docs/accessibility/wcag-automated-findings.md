# Automated accessibility findings (Phase 3)

**Date:** 2026-09-07  
**Scope:** Expanded automated evidence across axe, contrast, alt inventory, keyboard/focus interaction tests, ARIA hygiene, and touch-target CSS checks.

## AUTOMATED FINDINGS

| Area | Evidence | Result |
|------|----------|--------|
| axe-core (vitest-axe) | Button, StateMessage, PageBreadcrumbs, FAQ | No violations in isolated trees |
| Contrast tokens | `contrast.test.ts` | AA ≥4.5 for controlled token pairs |
| Image alt inventory | `image-alt-inventory.test.ts` | `Image` / `RestaurantImage` require `alt` |
| Keyboard / focus | `keyboard-focus.a11y.test.tsx` | Skip-link focus; FAQ Enter; Dialog Escape restores focus; Sheet Escape closes |
| ARIA hygiene | FAQ `aria-controls` / `aria-labelledby` / decorative `aria-hidden` on chevron | Fixed real gap; no ARIA spray |
| Touch targets (code) | `touch-targets.test.ts` + CSS `min-h-11` on chips/slots/buttons | Static verification only |

## MANUAL / EXTERNAL (not claimed)

| Area | Status |
|------|--------|
| Full-site manual keyboard audit | Required externally |
| Screen reader (VoiceOver/NVDA) | Required externally |
| Physical device touch QA | Required externally |
| WCAG 2.x certification | **Not claimed** |

## How to re-run

```bash
cd frontend && npm test
```

Related: `#141` automated WCAG findings, `#142`/`#144` keyboard/focus tests, `#149` ARIA, `#134` touch CSS.
