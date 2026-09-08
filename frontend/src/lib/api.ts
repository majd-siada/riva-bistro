import { productionApiOrigins, resolvePublicApiOrigin } from "@/config/api";
import type {
  Availability,
  AvailabilitySlot,
  Category,
  ContactMessageRequest,
  EventInquiryRequest,
  ModifierGroup,
  ModifierOption,
  OpeningHour,
  Pricing,
  Product,
  ProductDetail,
  Reservation,
  ReservationRequest,
} from "@riva-bistro/api-client";

export type {
  Availability,
  AvailabilitySlot,
  Category,
  ContactMessageRequest,
  EventInquiryRequest,
  ModifierGroup,
  ModifierOption,
  OpeningHour,
  Pricing,
  Product,
  ProductDetail,
  Reservation,
  ReservationRequest,
};

function getApiBase(): string {
  if (typeof window === "undefined") {
    const internalUrl = process.env.INTERNAL_API_URL?.replace(/\/$/, "");
    if (internalUrl) return internalUrl;
    // Prefer the same production-safe resolution used for media / browser.
    return resolvePublicApiOrigin();
  }
  return resolvePublicApiOrigin(window.location.hostname);
}

/** Public origin the browser can always reach (for resolving media paths). */
export function publicApiOrigin(): string {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : undefined;
  return resolvePublicApiOrigin(hostname);
}

/** Warn when the built API URL cannot work in the current browser context. */
export function getApiMisconfigurationMessage(): string | null {
  if (typeof window === "undefined") return null;

  const host = window.location.hostname;
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const api = resolvePublicApiOrigin(host);
  const isLocalHost =
    host === "localhost" || host === "127.0.0.1" || host === "backend";

  if (
    configured &&
    (configured.includes("localhost") || configured.includes("127.0.0.1")) &&
    !isLocalHost
  ) {
    return "NEXT_PUBLIC_API_URL pekar på localhost i en produktionsbuild. Bygg om med https://api.rivabistro.se.";
  }

  if (!configured && !productionApiOrigins[host] && !isLocalHost) {
    return "NEXT_PUBLIC_API_URL saknas. Admin kräver en publik API-URL vid build.";
  }

  if (
    !isLocalHost &&
    (api.includes("localhost") ||
      api.includes("127.0.0.1") ||
      api.includes("backend:"))
  ) {
    return "API-pekaren går till en lokal adress. Sätt NEXT_PUBLIC_API_URL till din publika backend-URL.";
  }

  return null;
}

export async function checkApiHealth(): Promise<{ ok: true } | { ok: false; message: string }> {
  const configError = getApiMisconfigurationMessage();
  if (configError) return { ok: false, message: configError };

  try {
    const res = await fetch(`${publicApiOrigin()}/api/v1/health/`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      return { ok: false, message: `API svarade med fel (${res.status}).` };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      message:
        "Kunde inte nå API:t. Kontrollera att backend körs och att CORS är konfigurerad.",
    };
  }
}

/**
 * Resolve image URLs for the browser.
 * - Absolute http(s) URLs pass through.
 * - `/media/...` paths are served by Django → prepend public API origin.
 * - Other relative paths (`/scenes/`, `/menu/`) stay same-origin (Next.js public/).
 */
export function resolveImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/media/")) return `${publicApiOrigin()}${url}`;
  return url;
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code = "error") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Next.js fetch cache policy for public read-only content.
 * Writes, availability, auth, and health stay no-store (default).
 */
export const CACHE_REVALIDATE_SECONDS = {
  catalog: 60,
  hours: 300,
  news: 120,
  gallery: 300,
  site: 60,
  offers: 60,
  restaurant: 120,
} as const;

/** Mirrors apiFetch cache option selection — exported for unit tests. */
export function resolveFetchCacheOptions(opts?: {
  revalidate?: number;
}): { next: { revalidate: number } } | { cache: "no-store" } {
  return opts?.revalidate != null
    ? { next: { revalidate: opts.revalidate } }
    : { cache: "no-store" };
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  opts?: { revalidate?: number },
): Promise<T> {
  const cacheOpts = resolveFetchCacheOptions(opts);
  const res = await fetch(`${getApiBase()}/api/v1${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
    ...cacheOpts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    let detail =
      (body && (body.detail || body.message)) || "Något gick fel. Försök igen.";
    // Surface first DRF field error when detail is absent (e.g. email/phone).
    if (
      body &&
      typeof body === "object" &&
      !body.detail &&
      !body.message &&
      !body.code
    ) {
      for (const value of Object.values(body as Record<string, unknown>)) {
        if (Array.isArray(value) && typeof value[0] === "string") {
          detail = value[0];
          break;
        }
        if (typeof value === "string") {
          detail = value;
          break;
        }
      }
    }
    const code = (body && body.code) || "error";
    throw new ApiError(detail, res.status, code);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function fetchHealth(): Promise<{ status: string }> {
  return apiFetch("/health/");
}

export async function fetchCategories(): Promise<Category[]> {
  return apiFetch("/menu/categories/", undefined, {
    revalidate: CACHE_REVALIDATE_SECONDS.catalog,
  });
}

export async function fetchProducts(category?: string): Promise<Product[]> {
  const q = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiFetch(`/menu/products/${q}`, undefined, {
    revalidate: CACHE_REVALIDATE_SECONDS.catalog,
  });
}

export async function fetchFeatured(): Promise<Product[]> {
  return apiFetch("/menu/featured/", undefined, {
    revalidate: CACHE_REVALIDATE_SECONDS.catalog,
  });
}

export async function fetchProduct(slug: string): Promise<ProductDetail> {
  return apiFetch(`/menu/products/${slug}/`, undefined, {
    revalidate: CACHE_REVALIDATE_SECONDS.catalog,
  });
}

export async function fetchHours(): Promise<OpeningHour[]> {
  return apiFetch("/hours/", undefined, {
    revalidate: CACHE_REVALIDATE_SECONDS.hours,
  });
}

export async function fetchAvailability(date: string): Promise<Availability> {
  return apiFetch(`/reservations/availability/?date=${encodeURIComponent(date)}`);
}

export async function createReservation(
  data: ReservationRequest,
): Promise<Reservation> {
  return apiFetch("/reservations/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function sendContactMessage(
  data: ContactMessageRequest,
): Promise<{ status: string }> {
  return apiFetch("/contact/", { method: "POST", body: JSON.stringify(data) });
}

export async function sendEventInquiry(
  data: EventInquiryRequest,
): Promise<{ status: string }> {
  return apiFetch("/events/inquiry/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export type NewsItem = {
  id: number;
  title: string;
  slug: string;
  body: string;
  published_at: string | null;
};

export type GalleryItem = {
  id: number;
  title: string;
  alt: string;
  src: string;
  sort_order: number;
};

export type AdminContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  email_sent: boolean;
  created_at: string;
};

export type AdminEventInquiry = {
  id: number;
  name: string;
  email: string;
  phone: string;
  event_type: string;
  guests: string;
  date: string;
  message: string;
  email_sent: boolean;
  created_at: string;
};

export async function fetchNews(): Promise<NewsItem[]> {
  return apiFetch("/news/", undefined, {
    revalidate: CACHE_REVALIDATE_SECONDS.news,
  });
}

export async function fetchGallery(): Promise<GalleryItem[]> {
  return apiFetch("/gallery/", undefined, {
    revalidate: CACHE_REVALIDATE_SECONDS.gallery,
  });
}

export type RestaurantProfile = {
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

export type SiteContent = {
  hero_title: string;
  hero_body: string;
  hero_image_url: string;
  hero_src: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
  about_title: string;
  about_body: string;
  about_image_url: string;
  about_src: string;
};

export type PublicOffer = {
  id: number;
  title: string;
  description: string;
  src: string;
  price_label: string;
  starts_at: string | null;
  ends_at: string | null;
  sort_order: number;
};

export async function fetchRestaurantProfile(): Promise<RestaurantProfile> {
  return apiFetch("/restaurant/", undefined, {
    revalidate: CACHE_REVALIDATE_SECONDS.restaurant,
  });
}

export async function fetchSiteContent(): Promise<SiteContent> {
  return apiFetch("/site-content/", undefined, {
    revalidate: CACHE_REVALIDATE_SECONDS.site,
  });
}

export async function fetchOffers(): Promise<PublicOffer[]> {
  return apiFetch("/offers/", undefined, {
    revalidate: CACHE_REVALIDATE_SECONDS.offers,
  });
}
