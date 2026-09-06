import { business, fullAddress } from "@/config/business";
import { OFFICIAL_OPENING_HOURS } from "@/config/opening-hours";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const SCHEMA_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

function openingHoursSpecification() {
  return OFFICIAL_OPENING_HOURS.filter((d) => !d.isClosed).map((d) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: SCHEMA_DAYS[d.weekday],
    opens: d.opens,
    closes: d.closes,
  }));
}

/**
 * Restaurant + WebSite structured data.
 *
 * Publishes confirmed NAP (address, phone, email), official opening hours,
 * menu URL and reservation acceptance. Social `sameAs` is included only when
 * `business.verified` is true (social URLs may still be placeholders).
 */
export function RestaurantJsonLd() {
  const socialLinks: string[] = [business.social.instagram, business.social.facebook];
  const sameAs = business.verified ? socialLinks : [];

  const restaurant: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: business.name,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    image: `${SITE_URL}/og-image.jpg`,
    telephone: business.phoneE164 || undefined,
    email: business.email || undefined,
    servesCuisine: ["Swedish", "European"],
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      postalCode: business.address.postalCode,
      addressLocality: business.address.city,
      addressRegion: business.area,
      addressCountry: business.address.country,
    },
    hasMenu: `${SITE_URL}/meny`,
    acceptsReservations: true,
    openingHoursSpecification: openingHoursSpecification(),
  };

  if (sameAs.length > 0) {
    restaurant.sameAs = sameAs;
  }

  const cleaned = JSON.parse(JSON.stringify(restaurant)) as Record<string, unknown>;

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#restaurant` },
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [cleaned, website],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

export type FaqJsonLdItem = { question: string; answer: string };

/** FAQPage JSON-LD for pages that already show a real FAQ to visitors. */
export function FaqJsonLd({ items }: { items: FaqJsonLdItem[] }) {
  if (!items.length) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** @deprecated kept for tests that assert NAP formatting */
export function restaurantDescription(): string {
  return `${business.name} — ${fullAddress()}`;
}
