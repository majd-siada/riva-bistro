/** Production hostname → public API origin (when NEXT_PUBLIC_API_URL is unset / invalid). */
export const PRODUCTION_API_ORIGIN = "https://api.rivabistro.se";

export const productionApiOrigins: Record<string, string> = {
  "rivabistro.se": PRODUCTION_API_ORIGIN,
  "www.rivabistro.se": PRODUCTION_API_ORIGIN,
};

function isLocalApiUrl(url: string | undefined | null): boolean {
  if (!url) return true;
  return (
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.includes("0.0.0.0")
  );
}

/**
 * Resolve the public API origin for browser / media URL use.
 * A baked NEXT_PUBLIC_API_URL that points at localhost is treated as unset so
 * production hostname mapping (or the production default) can apply.
 */
export function resolvePublicApiOrigin(hostname?: string): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured && !isLocalApiUrl(configured)) {
    return configured;
  }

  if (hostname) {
    const mapped = productionApiOrigins[hostname];
    if (mapped) return mapped;
  }

  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_API_ORIGIN;
  }

  return "http://localhost:8000";
}
