import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

/**
 * Allow public crawling. Block admin. Point crawlers at the sitemap.
 * Do not block CSS/JS/images — Next serves those under allowed paths.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
