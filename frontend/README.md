# Riva Bistro — Frontend

All frontend code lives in this folder. Open **`frontend/`** in Cursor for website work.

## Folder map

```text
frontend/
├── src/
│   ├── app/                    # Next.js routes (pages, layouts, loading, error)
│   ├── components/
│   │   ├── ui/                 # shadcn primitives (button, input, card, …)
│   │   ├── brand/              # logo, dividers, section headings, FAQ
│   │   ├── layout/             # header, footer, app-shell, section
│   │   ├── features/
│   │   │   ├── menu/           # food cards, category nav, product detail
│   │   │   ├── booking/        # reservation form
│   │   │   ├── contact/        # contact + event inquiry forms
│   │   │   └── admin/          # admin shell
│   │   └── seo/                # JSON-LD helpers
│   ├── lib/                    # API clients, validation, format, utils
│   └── config/                 # business constants (address, hours, social)
├── public/                     # images, brand assets, og-image
└── packages/
    ├── api-client/             # generated OpenAPI TypeScript types
    └── design-tokens/          # design token JSON
```

## Key files

| Purpose | Path |
|---------|------|
| Public API calls | `src/lib/api.ts` |
| Admin API calls | `src/lib/admin-api.ts` |
| Form validation | `src/lib/validation.ts` |
| Global styles | `src/app/globals.css` |
| Site metadata | `src/lib/site.ts` |
| Business info | `src/config/business.ts` |

## Commands

```bash
# From repo root (Docker)
docker compose exec web npm run dev
docker compose exec web npm run lint
docker compose exec web npm run typecheck
docker compose exec web npm run test
docker compose exec web npm run build

# Locally
cd frontend
npm install
npm run dev
```

## Import conventions

```ts
import { FoodCard } from "@/components/features/menu";
import { ReservationForm } from "@/components/features/booking";
import { ContactForm } from "@/components/features/contact";
import { fetchProducts } from "@/lib/api";
```

See the root [README](../README.md) for full stack setup.
