/**
 * Central, editable source of the restaurant's real-world facts.
 *
 * `verified` must stay false until address, phone, email, hours (and social
 * if shown) have been confirmed by the restaurant.
 *
 * Behaviour:
 * - verified=false → NAP may still render in the UI; Restaurant JSON-LD is omitted.
 * - verified=true  → JSON-LD publishes; only set after OWNER confirms real values.
 *
 * Address matches the owner-provided Google Business listing
 * (Hornsbergs Strand 57). Phone / email / social / kitchen hours are still
 * placeholders — keep verified=false until those are confirmed.
 *
 * Opening hours: prefer Admin → Öppettider / GET /api/v1/hours/ at runtime.
 * `restaurantHoursLabel` is a static fallback from `opening-hours.ts`
 * (must match `apps/backend/reservations/official_hours.py`).
 *
 * Cutover checklist: docs/deployment/production-checklist.md section A.
 */
import { OFFICIAL_HOURS_LABEL } from "@/config/opening-hours";

export const business = {
  name: "Riva Bistro",
  verified: false,
  tagline: "Goda smaker, äkta upplevelser",
  city: "Stockholm",
  address: {
    street: "Hornsbergs Strand 57",
    postalCode: "112 16",
    city: "Stockholm",
    country: "SE",
  },
  phone: "08 – 123 45 67",
  phoneHref: "tel:+4681234567",
  phoneE164: "+4681234567",
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
