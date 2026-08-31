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
} from "@riva-bistro/api-client";

function getApiBase(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (typeof window === "undefined") {
    const internalUrl = process.env.INTERNAL_API_URL?.replace(/\/$/, "");
    return internalUrl ?? publicUrl ?? "http://localhost:8000";
  }
  return publicUrl ?? "http://localhost:8000";
}

/** Public origin the browser can always reach (for resolving media paths). */
export function publicApiOrigin(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";
}

/** Resolve a possibly-relative media path (e.g. /media/x.webp) to an absolute URL. */
export function resolveImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${publicApiOrigin()}${url}`;
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

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  opts?: { revalidate?: number },
): Promise<T> {
  const cacheOpts =
    opts?.revalidate != null
      ? { next: { revalidate: opts.revalidate } }
      : { cache: "no-store" as const };
  const res = await fetch(`${getApiBase()}/api/v1${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
    ...cacheOpts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail =
      (body && (body.detail || body.message)) || "Något gick fel. Försök igen.";
    const code = (body && body.code) || "error";
    throw new ApiError(detail, res.status, code);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

import type {
  Availability,
  Category,
  ContactMessageRequest,
  EventInquiryRequest,
  OpeningHour,
  Product,
  ProductDetail,
  Reservation,
  ReservationRequest,
} from "@riva-bistro/api-client";

export async function fetchHealth(): Promise<{ status: string }> {
  return apiFetch("/health/");
}

export async function fetchCategories(): Promise<Category[]> {
  return apiFetch("/menu/categories/");
}

export async function fetchProducts(category?: string): Promise<Product[]> {
  const q = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiFetch(`/menu/products${q}`);
}

export async function fetchFeatured(): Promise<Product[]> {
  return apiFetch("/menu/featured/");
}

export async function fetchProduct(slug: string): Promise<ProductDetail> {
  return apiFetch(`/menu/products/${slug}/`);
}

export async function fetchHours(): Promise<OpeningHour[]> {
  return apiFetch("/hours/", undefined, { revalidate: 300 });
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
