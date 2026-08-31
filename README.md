# Riva Bistro

Premium Swedish restaurant website and reservation platform.

Monorepo:

- `frontend/` — Next.js (App Router, TypeScript, Tailwind, shadcn/ui) + `packages/api-client` and `packages/design-tokens`
- `apps/backend` — Django + Django REST Framework + PostgreSQL
- `docs/` — architecture, API, and product documentation
- `infrastructure/docker/` — Dockerfiles and entrypoints

## Prerequisites

- Docker Desktop / Docker Engine **29+** with Compose
- Node.js **24+** (for local frontend tooling outside containers)
- Python **3.13+** (for local backend tooling outside containers)
- Git

## Quick start (Docker)

```bash
# 1. Clone and enter the repo
cd riva-bistro

# 2. Environment
cp .env.example .env

# 3. Start the stack
docker compose up --build
```

Services:

| Service  | URL                          |
|----------|------------------------------|
| Web      | http://localhost:3000        |
| API      | http://localhost:8000        |
| Health   | http://localhost:8000/api/v1/health/ |
| OpenAPI  | http://localhost:8000/api/v1/schema/ |
| API docs | http://localhost:8000/api/v1/docs/   |
| Postgres | localhost:5432               |

Stop:

```bash
docker compose down
```

Reset database volume (destructive):

```bash
docker compose down -v
```

## Environment

Copy `.env.example` → `.env`. Never commit `.env`.

Key variables:

- `POSTGRES_*` — database credentials
- `DJANGO_SECRET_KEY` / `DJANGO_DEBUG` / CORS / CSRF
- `DATABASE_URL` — Django connection string
- `NEXT_PUBLIC_API_URL` — browser → API
- `INTERNAL_API_URL` — server-side Next.js → API inside Compose

## Backend commands

Inside the container:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend pytest
docker compose exec backend ruff check .
docker compose exec backend python manage.py spectacular --file /tmp/openapi.yaml
```

Locally (optional, with venv + Postgres reachable):

```bash
cd apps/backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
pytest
ruff check .
```

## Frontend commands

Inside the container:

```bash
docker compose exec web npm run lint
docker compose exec web npm run typecheck
docker compose exec web npm run test
```

Locally:

```bash
cd frontend
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
```

## Migrations

```bash
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

The backend entrypoint waits for Postgres and runs `migrate` on startup.

## Tests

```bash
# Backend
docker compose exec backend pytest

# Frontend
docker compose exec web npm run typecheck
docker compose exec web npm run lint
docker compose exec web npm run test
```

## OpenAPI → generated TypeScript client

The Django schema is the contract. Regenerate types after API changes:

```bash
# Export schema from Django
docker compose exec backend python manage.py spectacular --file /tmp/openapi.yaml
docker compose cp backend:/tmp/openapi.yaml frontend/packages/api-client/openapi.yaml

# Generate TypeScript types into frontend/packages/api-client
npm run generate:api
```

The web app imports types from `@riva-bistro/api-client` (thin fetch wrappers remain in `frontend/src/lib/api.ts` and `admin-api.ts`).

**Rule:** frontend must not invent API request/response shapes.

## Project structure

```text
riva-bistro/
├── frontend/                # Next.js frontend (+ api-client, design-tokens)
│   ├── src/
│   │   ├── app/             # Next.js routes
│   │   ├── components/      # UI, layout, brand, features
│   │   ├── lib/             # API clients, validation, utils
│   │   └── config/          # Business constants
│   └── packages/
│       ├── api-client/      # generated OpenAPI client/types
│       └── design-tokens/
├── apps/
│   └── backend/             # Django backend
├── docs/
│   ├── architecture/
│   ├── api/
│   └── product/
├── infrastructure/
│   └── docker/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Phase roadmap

See `docs/product/mvp.md`. Phases 1–3 (foundation, reservations, typed client) are complete. Phase 4 CMS is partial.

## License

Proprietary — all rights reserved.
