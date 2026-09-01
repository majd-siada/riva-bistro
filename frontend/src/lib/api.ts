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

/** Warn when the built API URL cannot work in the current browser context. */
export function getApiMisconfigurationMessage(): string | null {
  if (typeof window === "undefined") return null;

  const api = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const host = window.location.hostname;
  const isLocalHost =
    host === "localhost" || host === "127.0.0.1" || host === "backend";

  if (!api) {
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
