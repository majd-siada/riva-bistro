/**
 * Central, editable source of the restaurant's real-world facts.
 */
export const business = {
  name: "Riva Bistro",
  verified: true,
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
