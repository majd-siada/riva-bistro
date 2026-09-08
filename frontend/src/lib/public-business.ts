/**
 * Resolve public NAP/brand facts from API RestaurantProfile with config fallback.
 */
import { business as fallback } from "@/config/business";

export type PublicBusiness = {
  name: string;
  tagline: string;
  area: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  phoneHref: string;
  phoneE164: string;
  email: string;
  mapUrl: string;
  social: { instagram: string; facebook: string };
  verified: boolean;
  kitchenHours: string;
  restaurantHoursLabel: string;
};

export type RestaurantProfileDto = {
  name: string;
  tagline: string;
  street: string;
  postal_code: string;
  city: string;
  country: string;
  area: string;
  phone: string;
  phone_e164: string;
  email: string;
  map_url: string;
  social_instagram: string;
  social_facebook: string;
  social_verified: boolean;
  kitchen_hours: string;
};

export function businessFromProfile(
  profile: RestaurantProfileDto | null | undefined,
): PublicBusiness {
  if (!profile) {
    return {
      name: fallback.name,
      tagline: fallback.tagline,
      area: fallback.area,
      street: fallback.address.street,
      postalCode: fallback.address.postalCode,
      city: fallback.address.city,
      country: fallback.address.country,
      phone: fallback.phone,
      phoneHref: fallback.phoneHref,
      phoneE164: fallback.phoneE164,
      email: fallback.email,
      mapUrl: fallback.mapUrl,
      social: { ...fallback.social },
      verified: fallback.verified,
      kitchenHours: fallback.kitchenHours,
      restaurantHoursLabel: fallback.restaurantHoursLabel,
    };
  }
  const phone = profile.phone || fallback.phone;
  const e164 = profile.phone_e164 || fallback.phoneE164;
  return {
    name: profile.name || fallback.name,
    tagline: profile.tagline || fallback.tagline,
    area: profile.area || fallback.area,
    street: profile.street || fallback.address.street,
    postalCode: profile.postal_code || fallback.address.postalCode,
    city: profile.city || fallback.address.city,
    country: profile.country || fallback.address.country,
    phone,
    phoneHref: e164 ? `tel:${e164}` : fallback.phoneHref,
    phoneE164: e164,
    email: profile.email || fallback.email,
    mapUrl: profile.map_url || fallback.mapUrl,
    social: {
      instagram: profile.social_instagram || fallback.social.instagram,
      facebook: profile.social_facebook || fallback.social.facebook,
    },
    verified: profile.social_verified,
    kitchenHours: profile.kitchen_hours || "",
    restaurantHoursLabel: fallback.restaurantHoursLabel,
  };
}

export function fullAddressFrom(b: PublicBusiness): string {
  return `${b.street}, ${b.postalCode} ${b.city}`;
}

export function shortAddressFrom(b: PublicBusiness): string {
  return `${b.street} · ${b.city}`;
}

export function mapsEmbedUrlFrom(b: PublicBusiness): string {
  const query = encodeURIComponent(`${b.street} ${b.postalCode} ${b.city}`);
  return `https://maps.google.com/maps?q=${query}&output=embed`;
}
