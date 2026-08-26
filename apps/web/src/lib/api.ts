const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

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

export interface CartLine {
  id: number;
  product: number;
  product_name: string;
  product_slug: string;
  quantity: number;
  selected_modifiers: { option_id: number; name: string }[];
  unit_pricing: Pricing;
  line_pricing: Pricing;
}

export interface CartTotals {
  subtotal_ex_vat: string;
  vat_total: string;
  total_inc_vat: string;
}

export interface Cart {
  id: number;
  lines: CartLine[];
  totals: CartTotals;
}

export interface OrderLine {
  product_name: string;
  quantity: number;
  unit_price_ex_vat: string;
  vat_rate: string;
  vat_amount: string;
  line_total_inc_vat: string;
  selected_modifiers: unknown[];
}

export interface Order {
  id: number;
  ref: string;
  status: string;
  payment_status: string;
  subtotal_ex_vat: string;
  vat_total: string;
  total_inc_vat: string;
  notes: string;
  customer_name: string;
  customer_email: string;
  lines: OrderLine[];
  created_at: string;
  updated_at: string;
}

export interface AdminOverview {
  orders_today: number;
  revenue_total: string;
  avg_ticket: string;
  low_stock_count: number;
  pending_orders: number;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
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

export async function fetchCart(): Promise<Cart> {
  return apiFetch("/cart/");
}

export async function addCartLine(data: {
  product_id: number;
  quantity: number;
  selected_modifiers?: { option_id: number; name: string }[];
}): Promise<CartLine> {
  return apiFetch("/cart/lines/", { method: "POST", body: JSON.stringify(data) });
}

export async function updateCartLine(
  lineId: number,
  data: { quantity?: number; selected_modifiers?: unknown[] },
): Promise<CartLine> {
  return apiFetch(`/cart/lines/${lineId}/`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function removeCartLine(lineId: number): Promise<void> {
  return apiFetch(`/cart/lines/${lineId}/`, { method: "DELETE" });
}

export async function checkout(data: {
  email: string;
  name: string;
  phone?: string;
  notes?: string;
}): Promise<Order> {
  return apiFetch("/orders/checkout/", { method: "POST", body: JSON.stringify(data) });
}

export async function fetchOrder(ref: string): Promise<Order> {
  return apiFetch(`/orders/${ref}/`);
}

export async function fetchOrderStatus(ref: string): Promise<{ ref: string; status: string; payment_status: string }> {
  return apiFetch(`/orders/${ref}/status/`);
}

export async function fetchAccountOrders(email: string): Promise<Order[]> {
  return apiFetch(`/account/orders/?email=${encodeURIComponent(email)}`);
}

export async function fetchAccountOrder(orderId: number, email: string): Promise<Order> {
  return apiFetch(`/account/orders/${orderId}/?email=${encodeURIComponent(email)}`);
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  return apiFetch("/admin/overview/");
}

export async function fetchAdminOrders(status?: string): Promise<Order[]> {
  const q = status ? `?status=${status}` : "";
  return apiFetch(`/admin/orders${q}`);
}

export async function fetchAdminOrder(orderId: number): Promise<Order> {
  return apiFetch(`/admin/orders/${orderId}/`);
}

export async function updateAdminOrderStatus(orderId: number, status: string): Promise<Order> {
  return apiFetch(`/admin/orders/${orderId}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function fetchAdminProducts(): Promise<Product[]> {
  return apiFetch("/admin/products/");
}

export async function fetchAdminCategories(): Promise<Category[]> {
  return apiFetch("/admin/categories/");
}

export async function fetchAdminInventory(): Promise<
  { id: number; name: string; slug: string; inventory_count: number; is_available: boolean; category__name: string }[]
> {
  return apiFetch("/admin/inventory/");
}

export async function fetchAdminCustomers(): Promise<
  { id: number; email: string; name: string; phone: string; order_count: number; created_at: string }[]
> {
  return apiFetch("/admin/customers/");
}

export async function fetchAdminSales(): Promise<{
  total_orders: number;
  total_revenue: string;
  total_vat: string;
}> {
  return apiFetch("/admin/sales/");
}
