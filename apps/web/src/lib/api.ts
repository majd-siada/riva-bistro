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

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBase()}/api/v1${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "include",
    cache: "no-store",
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

// --- Types -------------------------------------------------------------------

export interface Pricing {
  price_ex_vat: string;
  vat_amount: string;
  price_inc_vat: string;
  vat_rate: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  product_count: number;
}

export interface ModifierOption {
  id: number;
  name: string;
  price_delta: string;
  is_available: boolean;
  pricing: Pricing;
}

export interface ModifierGroup {
  id: number;
  name: string;
  min_selections: number;
  max_selections: number;
  required: boolean;
  options: ModifierOption[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  category_name: string;
  category_slug: string;
  pricing: Pricing;
  modifier_groups?: ModifierGroup[];
}

export interface OpeningHour {
  weekday: number;
  weekday_label: string;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
}

export interface AvailabilitySlot {
  time: string;
  remaining: number;
  available: boolean;
}

export interface Availability {
  date: string;
  enabled: boolean;
  closed: boolean;
  max_party_size: number;
  slots: AvailabilitySlot[];
}

export interface ReservationRequest {
  name: string;
  phone: string;
  email: string;
  party_size: number;
  date: string;
  time: string;
  special_request?: string;
}

export interface Reservation {
  id: number;
  ref: string;
  name: string;
  email: string;
  party_size: number;
  date: string;
  time: string;
  status: string;
  status_label: string;
  email_sent?: boolean;
}

export interface ContactMessageRequest {
  name: string;
  email: string;
  message: string;
}

export interface EventInquiryRequest {
  name: string;
  email: string;
  phone?: string;
  event_type?: string;
  guests?: string;
  date?: string;
  message: string;
}

// --- Public endpoints --------------------------------------------------------

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

export async function fetchProduct(slug: string): Promise<Product> {
  return apiFetch(`/menu/products/${slug}/`);
}

export async function fetchHours(): Promise<OpeningHour[]> {
  return apiFetch("/hours/");
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
