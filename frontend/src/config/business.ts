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
 * When the owner supplies real values, update this file (street, postalCode, city,
 * phone / phoneHref / phoneE164, email, restaurantHoursLabel, kitchenHours, mapUrl,
 * social), then set verified=true. Prefer Admin → Öppettider as the live hours API
 * source of truth; labels here are display fallbacks only.
 *
 * Cutover checklist: docs/deployment/production-checklist.md section A.
 */
export const business = {
  name: "Riva Bistro",
  verified: false,
  tagline: "Goda smaker, äkta upplevelser",
  city: "Stockholm",
  address: {
    street: "Strandvägen 5",
    postalCode: "114 51",
    city: "Stockholm",
    country: "SE",
  },
  phone: "08 – 123 45 67",
  phoneHref: "tel:+4681234567",
  phoneE164: "+4681234567",
  email: "info@rivabistro.se",
  kitchenHours: "Kökets öppettider Mån–Sön 12:00–22:00",
  restaurantHoursLabel: "Mån–Fre 16–23, Lör–Sön 12–23",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Strandvägen+5+114+51+Stockholm",
  social: {
    instagram: "https://instagram.com/rivabistro",
    facebook: "https://facebook.com/rivabistro",
  },
} as const;

export function fullAddress(): string {
  const { street, postalCode, city } = business.address;
  return `${street}, ${postalCode} ${city}`;
}
