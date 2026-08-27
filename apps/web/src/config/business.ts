/**
 * Central, editable source of the restaurant's real-world facts.
 *
 * IMPORTANT: These values are PLACEHOLDERS until confirmed by the restaurant.
 * Do not treat them as verified. `verified` gates public structured data
 * (JSON-LD) so we never publish unverified business claims to search engines.
 * Opening hours are managed in the admin (backend), not here.
 */
export const business = {
  name: "Riva Bistro",
  verified: false,
  tagline: "Kust & kök",
  city: "Stockholm",
  address: {
    street: "Strandvägen 12",
    postalCode: "114 56",
    city: "Stockholm",
    country: "SE",
  },
  phone: "+46 8 123 45 67",
  phoneHref: "tel:+4681234567",
  email: "info@rivabistro.se",
  social: {
    instagram: "",
    facebook: "",
  },
} as const;

export function fullAddress(): string {
  const { street, postalCode, city } = business.address;
  return `${street}, ${postalCode} ${city}`;
}
