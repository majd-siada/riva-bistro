"use client";

export type {
  AdminCategory,
  AdminClosure,
  AdminOpeningHour,
  AdminOverview,
  AdminProduct,
  AdminReservation,
  AdminSession,
  AdminSettings,
} from "@riva-bistro/api-client";

import type {
  AdminCategory,
  AdminClosure,
  AdminOpeningHour,
  AdminOverview,
  AdminProduct,
  AdminReservation,
  AdminSession,
  AdminSettings,
} from "@riva-bistro/api-client";
import { ApiError, publicApiOrigin } from "@/lib/api";
import type { AdminContactMessage, AdminEventInquiry } from "@/lib/api";

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
  }).catch((error: unknown) => {
    if (error instanceof TypeError) {
      throw new ApiError(
        "Kunde inte nå API:t. Kontrollera att backend körs och att CORS är konfigurerad.",
        0,
        "network",
      );
    }
    throw error;
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const detail =
      (data && (data.detail || data.message)) ||
      res.statusText ||
      "Något gick fel. Försök igen.";
    throw new ApiError(detail, res.status, (data && data.code) || "error");
  }
  if (res.status === 204) return undefined as T;
  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError(
      "API:t returnerade ogiltigt svar. Kontrollera NEXT_PUBLIC_API_URL.",
      res.status,
      "invalid_response",
    );
  }
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

export async function adminGetHours() {
  return request<AdminOpeningHour[]>("/admin/hours/");
}

export async function adminSaveHours(hours: AdminOpeningHour[]) {
  return request<AdminOpeningHour[]>("/admin/hours/", { method: "PUT", body: hours });
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

export async function adminGetSettings() {
  return request<AdminSettings>("/admin/settings/");
}

export async function adminUpdateSettings(patch: Partial<AdminSettings>) {
  return request<AdminSettings>("/admin/settings/", { method: "PATCH", body: patch });
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

export type { AdminContactMessage, AdminEventInquiry };

export async function adminListContactMessages() {
  return request<AdminContactMessage[]>("/admin/inquiries/contact/");
}

export async function adminListEventInquiries() {
  return request<AdminEventInquiry[]>("/admin/inquiries/events/");
}
