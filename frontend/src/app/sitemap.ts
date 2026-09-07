import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/** Canonical public routes only — no admin, no hash/slug redirects, no duplicates. */
const PUBLIC_ROUTES: ReadonlyArray<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/meny", priority: 0.9 },
  { path: "/boka", priority: 0.9 },
  { path: "/privata-event", priority: 0.8 },
  { path: "/galleri", priority: 0.5 },
  { path: "/om-oss", priority: 0.6 },
  { path: "/kontakt", priority: 0.6 },
  { path: "/integritetspolicy", priority: 0.3 },
  { path: "/cookies", priority: 0.3 },
  { path: "/villkor", priority: 0.3 },
  { path: "/bokningspolicy", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  }));
}
