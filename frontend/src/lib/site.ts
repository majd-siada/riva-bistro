export const PRODUCTION_SITE_URL = "https://rivabistro.se";

function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured && !configured.includes("localhost") && !configured.includes("127.0.0.1")) {
    return configured;
  }
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }
  return configured || "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Riva Bistro";

export const SITE_DESCRIPTION =
  "Riva Bistro — goda smaker, äkta upplevelser på Kungsholmen i Stockholm. Boka bord och utforska menyn.";
