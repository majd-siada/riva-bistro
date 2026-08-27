"use client";

import { ApiError, publicApiOrigin } from "@/lib/api";

const BASE = `${publicApiOrigin()}/api/v1`;

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function ensureCsrf(): Promise<void> {
  if (getCookie("csrftoken")) return;
  await fetch(`${BASE}/admin/auth/csrf/`, { credentials: "include" });
}

async function request<T>(
  path: string,
  { method = "GET", body, isForm = false }: {
    method?: string;
    body?: unknown;
    isForm?: boolean;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  const unsafe = !["GET", "HEAD", "OPTIONS"].includes(method);
  if (unsafe) {
    await ensureCsrf();
    const token = getCookie("csrftoken");
    if (token) headers["X-CSRFToken"] = token;
  }
  let payload: BodyInit | undefined;
  if (body !== undefined) {
    if (isForm) {
      payload = body as FormData;
    } else {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: payload,
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const detail = (data && (data.detail || data.message)) || "Något gick fel.";
    throw new ApiError(detail, res.status, (data && data.code) || "error");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// --- Auth --------------------------------------------------------------------

export interface AdminSession {
  authenticated: boolean;
  username?: string;
  is_staff?: boolean;
}

export async function adminLogin(username: string, password: string) {
  return request<AdminSession>("/admin/auth/login/", {
    method: "POST",
    body: { username, password },
  });
}

export async function adminLogout() {
  return request<AdminSession>("/admin/auth/logout/", { method: "POST" });
}

export async function adminMe(): Promise<AdminSession> {
  return request<AdminSession>("/admin/auth/me/");
}

// --- Reservations ------------------------------------------------------------

export interface AdminReservation {
  id: number;
  ref: string;
  name: string;
  phone: string;
  email: string;
  party_size: number;
  date: string;
  time: string;
  special_request: string;
  status: string;
  status_label: string;
  created_at: string;
}

export interface AdminOverview {
  today_count: number;
  today_guests: number;
  upcoming_count: number;
  production_ready: boolean;
  max_guests_per_slot: number;
  todays_reservations: AdminReservation[];
}

export async function adminOverview() {
  return request<AdminOverview>("/admin/overview/");
}

export async function adminListReservations(params: {
  date?: string;
  status?: string;
  q?: string;
} = {}) {
  const qs = new URLSearchParams();
  if (params.date) qs.set("date", params.date);
  if (params.status) qs.set("status", params.status);
  if (params.q) qs.set("q", params.q);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return request<AdminReservation[]>(`/admin/reservations/${suffix}`);
}

export async function adminUpdateReservationStatus(id: number, status: string) {
  return request<AdminReservation>(`/admin/reservations/${id}/`, {
    method: "PATCH",
    body: { status },
  });
}

// --- Opening hours + closures + settings -------------------------------------

export interface AdminOpeningHour {
  weekday: number;
  weekday_label: string;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
}

export async function adminGetHours() {
  return request<AdminOpeningHour[]>("/admin/hours/");
}

export async function adminSaveHours(hours: AdminOpeningHour[]) {
  return request<AdminOpeningHour[]>("/admin/hours/", { method: "PUT", body: hours });
}

export interface AdminClosure {
  id: number;
  date: string;
  reason: string;
}

export async function adminListClosures() {
  return request<AdminClosure[]>("/admin/closures/");
}

export async function adminCreateClosure(date: string, reason: string) {
  return request<AdminClosure>("/admin/closures/", {
    method: "POST",
    body: { date, reason },
  });
}

export async function adminDeleteClosure(id: number) {
  return request<void>(`/admin/closures/${id}/`, { method: "DELETE" });
}

export interface AdminSettings {
  max_guests_per_slot: number;
  slot_interval_minutes: number;
  last_seating_buffer_minutes: number;
  max_party_size: number;
  booking_lead_minutes: number;
  booking_horizon_days: number;
  production_ready: boolean;
}

export async function adminGetSettings() {
  return request<AdminSettings>("/admin/settings/");
}

export async function adminUpdateSettings(patch: Partial<AdminSettings>) {
  return request<AdminSettings>("/admin/settings/", { method: "PATCH", body: patch });
}

// --- Menu (writes to the same catalog data) ----------------------------------

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  product_count: number;
}

export async function adminListCategories() {
  return request<AdminCategory[]>("/admin/menu/categories/");
}

export async function adminCreateCategory(data: Partial<AdminCategory>) {
  return request<AdminCategory>("/admin/menu/categories/", { method: "POST", body: data });
}

export async function adminUpdateCategory(id: number, data: Partial<AdminCategory>) {
  return request<AdminCategory>(`/admin/menu/categories/${id}/`, {
    method: "PATCH",
    body: data,
  });
}

export async function adminDeleteCategory(id: number) {
  return request<void>(`/admin/menu/categories/${id}/`, { method: "DELETE" });
}

export interface AdminProduct {
  id: number;
  category: number;
  category_name: string;
  name: string;
  slug: string;
  description: string;
  base_price: string;
  vat_rate: string;
  image_url: string;
  image_upload_url: string;
  is_available: boolean;
  is_featured: boolean;
  featured_order: number;
  sort_order: number;
}

export async function adminListProducts() {
  return request<AdminProduct[]>("/admin/menu/products/");
}

export async function adminCreateProduct(data: Partial<AdminProduct>) {
  return request<AdminProduct>("/admin/menu/products/", { method: "POST", body: data });
}

export async function adminUpdateProduct(id: number, data: Partial<AdminProduct>) {
  return request<AdminProduct>(`/admin/menu/products/${id}/`, {
    method: "PATCH",
    body: data,
  });
}

export async function adminDeleteProduct(id: number) {
  return request<void>(`/admin/menu/products/${id}/`, { method: "DELETE" });
}

export async function adminUploadProductImage(id: number, file: File) {
  const form = new FormData();
  form.append("image", file);
  return request<AdminProduct>(`/admin/menu/products/${id}/image/`, {
    method: "POST",
    body: form,
    isForm: true,
  });
}
