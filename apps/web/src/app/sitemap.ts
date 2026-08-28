import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    { path: "/", priority: 1 },
    { path: "/meny", priority: 0.9 },
    { path: "/boka", priority: 0.9 },
    { path: "/om-oss", priority: 0.6 },
    { path: "/kontakt", priority: 0.6 },
    { path: "/faq", priority: 0.5 },
  ];

  return routes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }));
}
