/**
 * Static legal / build-time NAP mirror for Riva Bistro.
 *
 * Operational source of truth for public marketing NAP is RestaurantProfile
 * (Admin → Restaurang) via `loadRestaurantBusiness()`. This file is the
 * intentional static fallback and the contact block for legal/policy pages
 * and the client booking form — values MUST stay identical to the live profile.
 *
 * Social URLs stay empty until the owner pastes real profile links in
 * Admin → Inställningar. Do not publish placeholder social URLs.
 *
 * Opening hours: prefer Admin → Öppettider / GET /api/v1/hours/ at runtime.
 * `restaurantHoursLabel` is a static fallback from `opening-hours.ts`.
 *
 * See docs/seo/nap-consistency.md.
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
  /** Owner-confirmed public number (display form). */
  phone: "08-704 20 50",
  phoneHref: "tel:+4687042050",
  phoneE164: "+4687042050",
  email: "info@rivabistro.se",
  /** Leave empty until the owner confirms kitchen last-order times. */
  kitchenHours: "",
  restaurantHoursLabel: OFFICIAL_HOURS_LABEL,
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Hornsbergs+Strand+57+112+16+Stockholm",
  social: {
    instagram: "",
    facebook: "",
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
