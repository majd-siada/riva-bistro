# JavaScript optimization notes (#126)

Inspection date: 2026-09-07. Brochure + booking MVP — avoid architecture rewrites for vanity metrics.

## Findings

| Area | Observation |
|------|-------------|
| Dependencies | Slim app deps (`next`, `react`, Radix primitives, `lucide-react`, `sonner`). No charts/analytics SDKs. |
| Client boundary | `FoodCard` had `"use client"` despite no hooks — forced client boundary when used from the server homepage. |
| Icons | Many `lucide-react` named imports; without `optimizePackageImports`, bundlers can over-include. |
| Dynamic import | No prior `next/dynamic` usage; cookie consent is non-critical for first paint. |
| Admin | Separate `/admin/*` routes — App Router already code-splits admin pages. |

## Changes made

1. Removed `"use client"` from `frontend/src/components/features/menu/food-card.tsx` so homepage/menu server trees can render it as RSC.
2. Enabled `experimental.optimizePackageImports: ["lucide-react"]` in `next.config.ts`.
3. Lazy-load `CookieNotice` via `next/dynamic` from root layout (separate client chunk; `ssr: false` is not used because the root layout is a Server Component).
4. Added reproducible analyzer: `npm run analyze` (`ANALYZE=true next build` + `@next/bundle-analyzer`, `openAnalyzer: false`).

## How to measure

```bash
cd frontend
npm run build          # First Load JS shared + route sizes in build output
npm run analyze        # Writes webpack-bundle-analyzer HTML under .next/analyze (openAnalyzer: false)
```

### Observed `next build` route sizes (2026-09-07, this environment)

| Route | Size | First Load JS |
|-------|------|---------------|
| `/` | 201 B | **124 kB** |
| `/meny` | 187 B | **124 kB** |
| `/boka` | 6.13 kB | 137 kB |
| shared by all | — | **102 kB** |

These are lab build outputs, not Lighthouse/CWV field scores.

## Out of scope

- Lighthouse CI / field CWV claims
- Rewriting admin into fewer client components for its own sake
- Adding Redis or other infra for perf
