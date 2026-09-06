/**
 * Central, editable source of the restaurant's real-world facts.
 *
 * Address and phone are owner-confirmed (Google Business listing + public number).
 * Social URLs may still be placeholders — do not publish them as JSON-LD `sameAs`
 * until `verified` is true.
 *
 * Behaviour:
 * - Core Restaurant JSON-LD (NAP, hours, menu, reservations) publishes from
 *   confirmed fields.
 * - `sameAs` (social) only when `verified === true`.
 *
 * Opening hours: prefer Admin → Öppettider / GET /api/v1/hours/ at runtime.
 * `restaurantHoursLabel` is a static fallback from `opening-hours.ts`
 * (must match backend official hours).
 *
 * Cutover checklist: docs/deployment/production-checklist.md section A.
 */
import { OFFICIAL_HOURS_LABEL } from "@/config/opening-hours";

export const business = {
  name: "Riva Bistro",
  /**
   * When true, social profiles may be included in JSON-LD `sameAs`.
   * Keep false until Instagram/Facebook URLs are owner-confirmed.
   */
  verified: false,
  tagline: "Goda smaker, äkta upplevelser",
  city: "Stockholm",
  /** Neighborhood used in local copy (not a postal field). */
  area: "Kungsholmen",
  address: {
    street: "Hornsbergs Strand 57",
    postalCode: "112 16",
    city: "Stockholm",
    country: "SE",
  },
  /** Owner-confirmed public number. */
  phone: "087042050",
  phoneHref: "tel:+4687042050",
  phoneE164: "+4687042050",
  email: "info@rivabistro.se",
  /** Leave empty until the owner confirms kitchen last-order times. */
  kitchenHours: "",
  restaurantHoursLabel: OFFICIAL_HOURS_LABEL,
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Hornsbergs+Strand+57+112+16+Stockholm",
  social: {
    instagram: "https://instagram.com/rivabistro",
    facebook: "https://facebook.com/rivabistro",
  },
} as const;

export function fullAddress(): string {
  const { street, postalCode, city } = business.address;
  return `${street}, ${postalCode} ${city}`;
}

/** Short footer line — still includes street number for NAP consistency. */
export function shortAddress(): string {
  return `${business.address.street} · ${business.address.city}`;
}

/** Google Maps embed URL derived from the same NAP as `mapUrl`. */
export function mapsEmbedUrl(): string {
  const query = encodeURIComponent(
    `${business.address.street} ${business.address.postalCode} ${business.address.city}`,
  );
  return `https://maps.google.com/maps?q=${query}&output=embed`;
}
