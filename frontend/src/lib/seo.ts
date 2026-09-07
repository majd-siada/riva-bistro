import type { Metadata } from "next";

import { SITE_NAME, SITE_URL } from "@/lib/site";

const OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Riva Bistro — grillad entrecôte på mörk tallrik, varm studioljus",
} as const;

export type PageSeoInput = {
  title: string;
  description: string;
  /** Path beginning with `/`, e.g. `/meny`. Use `/` for the homepage. */
  path: string;
  /** Absolute title for homepage (skips `%s · Site` template). */
  absoluteTitle?: string;
  noIndex?: boolean;
};

/**
 * Build consistent per-page metadata: unique title/description, canonical,
 * Open Graph and Twitter cards. Never invent business facts here.
 */
export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  noIndex,
}: PageSeoInput): Metadata {
  const normalized = path === "/" ? "" : path.replace(/\/$/, "");
  const url = `${SITE_URL}${normalized || ""}`;
  const ogTitle = absoluteTitle ?? `${title} · ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: path === "/" ? "/" : normalized },
    openGraph: {
      type: "website",
      locale: "sv_SE",
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      url,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [OG_IMAGE.url],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
