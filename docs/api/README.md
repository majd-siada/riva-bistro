# API Documentation

## Contract source of truth

The OpenAPI schema exported by Django (`drf-spectacular`) is the **only** API contract.

- Schema URL (local): `http://localhost:8000/api/v1/schema/`
- Interactive docs: `http://localhost:8000/api/v1/docs/`

## Versioning

Public HTTP APIs are versioned under `/api/v1/`.

## Phase 1 endpoints

| Method | Path              | Description                |
|--------|-------------------|----------------------------|
| GET    | `/api/v1/health/` | API + database health      |
| GET    | `/api/v1/schema/` | OpenAPI schema (JSON/YAML) |
| GET    | `/api/v1/docs/`   | Swagger UI                 |

## Generated TypeScript client

Workflow (introduced fully in Phase 3):

1. Export OpenAPI from Django.
2. Generate client/types into `packages/api-client`.
3. Consume the generated package from `apps/web`.

Never invent request/response shapes in the frontend.

## Auth (later)

Admin endpoints will require authentication and authorization. Public booking/read endpoints will remain intentionally limited and validated.
