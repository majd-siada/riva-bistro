import { business, fullAddress } from "@/config/business";
import { OFFICIAL_OPENING_HOURS } from "@/config/opening-hours";
import { loadRestaurantBusiness } from "@/lib/public-data";
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
 * NAP from RestaurantProfile API with config fallback.
 */
export async function RestaurantJsonLd() {
  const profile = await loadRestaurantBusiness();
  const socialLinks: string[] = [profile.social.instagram, profile.social.facebook];
  const sameAs = profile.verified ? socialLinks : [];

  const restaurant: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: profile.name,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    image: `${SITE_URL}/og-image.jpg`,
    telephone: profile.phoneE164 || undefined,
    email: profile.email || undefined,
    servesCuisine: ["Swedish", "European"],
    address: {
      "@type": "PostalAddress",
      streetAddress: profile.street,
      postalCode: profile.postalCode,
      addressLocality: profile.city,
      addressRegion: profile.area,
      addressCountry: profile.country,
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


export type BreadcrumbJsonLdItem = { name: string; path: string };

/** BreadcrumbList JSON-LD. Paths must be site-relative (e.g. `/meny`). */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbJsonLdItem[] }) {
  if (items.length < 2) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export type MenuJsonLdSection = {
  name: string;
  items: Array<{ name: string; description?: string; priceIncVat?: number | string }>;
};

/**
 * Menu structured data from the public catalog only — never invent dishes.
 * Emits nothing when there are no real items.
 */
export function MenuJsonLd({
  sections,
}: {
  sections: MenuJsonLdSection[];
}) {
  const hasItems = sections.some((s) => s.items.length > 0);
  if (!hasItems) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${SITE_URL}/meny#menu`,
    name: `${SITE_NAME} meny`,
    url: `${SITE_URL}/meny`,
    hasMenuSection: sections
      .filter((s) => s.items.length > 0)
      .map((section) => ({
        "@type": "MenuSection",
        name: section.name,
        hasMenuItem: section.items.map((item) => {
          const entry: Record<string, unknown> = {
            "@type": "MenuItem",
            name: item.name,
          };
          if (item.description) entry.description = item.description;
          if (item.priceIncVat !== undefined && item.priceIncVat !== "") {
            entry.offers = {
              "@type": "Offer",
              price: String(item.priceIncVat),
              priceCurrency: "SEK",
            };
          }
          return entry;
        }),
      })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
