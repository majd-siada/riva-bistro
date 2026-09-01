/** Production hostname → public API origin (when NEXT_PUBLIC_API_URL is unset at build). */
export const productionApiOrigins: Record<string, string> = {
  "rivabistro.se": "https://api.rivabistro.se",
  "www.rivabistro.se": "https://api.rivabistro.se",
};

export function resolvePublicApiOrigin(hostname?: string): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured) return configured;

  if (hostname) {
    const mapped = productionApiOrigins[hostname];
    if (mapped) return mapped;
  }

  return "http://localhost:8000";
}
