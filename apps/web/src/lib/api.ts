function getApiBase(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  // On the server (SSR / server components) the browser-facing URL
  // (e.g. localhost:8000) resolves to the web container itself, not the API.
  // Prefer the in-network URL (e.g. http://backend:8000) when running there.
  if (typeof window === "undefined") {
    const internalUrl = process.env.INTERNAL_API_URL?.replace(/\/$/, "");
    return internalUrl ?? publicUrl ?? "http://localhost:8000";
  }
  return publicUrl ?? "http://localhost:8000";
}

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
  category_name: string;
  category_slug: string;
  pricing: Pricing;
  modifier_groups?: ModifierGroup[];
  inventory_count?: number;
}

export interface ReservationRequest {
  date: string;
  time: string;
  party_size: number;
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface Reservation {
  ref: string;
  status: string;
  date: string;
  time: string;
  party_size: number;
}

export interface ContactMessageRequest {
  name: string;
  email: string;
  message: string;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBase()}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "API request failed");
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
  const q = category ? `?category=${category}` : "";
  return apiFetch(`/menu/products${q}`);
}

export async function fetchProduct(slug: string): Promise<Product> {
  return apiFetch(`/menu/products/${slug}/`);
}

// Reservations and contact are backend features that are not live yet. These
// calls are pre-wired to their planned endpoints; until the backend ships them
// the UI falls back to a graceful "we'll confirm manually" flow.
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
