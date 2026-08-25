/**
 * Placeholder for the generated OpenAPI client.
 *
 * Phase 3 will replace this package contents with generated types and fetch helpers
 * derived from Django's OpenAPI schema. Do not hand-write API DTOs here.
 */

export const API_CLIENT_PHASE = 1 as const;

export type HealthResponse = {
  status: string;
  service: string;
  database: string;
  detail?: string;
};

/** Minimal typed health helper until openapi-generator lands. */
export async function fetchHealth(baseUrl: string): Promise<HealthResponse> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/health/`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return (await response.json()) as HealthResponse;
}
