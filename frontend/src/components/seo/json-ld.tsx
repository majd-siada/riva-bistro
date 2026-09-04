import { business, fullAddress } from "@/config/business";
import { SITE_URL } from "@/lib/site";

/**
 * Restaurant / LocalBusiness structured data.
 *
 * Rendered ONLY when the business facts have been verified (see
 * config/business.ts `verified`). We never publish unverified/placeholder
 * business data to search engines.
 */
export function RestaurantJsonLd() {
  if (!business.verified) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: business.name,
    url: SITE_URL,
    servesCuisine: ["Svensk", "Mediterran"],
    telephone: business.phoneE164,
    email: business.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      postalCode: business.address.postalCode,
      addressLocality: business.address.city,
      addressCountry: business.address.country,
    },
    image: `${SITE_URL}/og-image.jpg`,
    description: `${business.name} — ${fullAddress()}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
