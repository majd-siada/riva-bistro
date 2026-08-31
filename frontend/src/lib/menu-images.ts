/** Frontend menu image convention: /menu/<slug>.jpg in public/. */

import { resolveImageUrl } from "@/lib/api";

export function menuImagePath(slug: string): string {
  return `/menu/${slug}.jpg`;
}

export const MENU_IMAGE_FALLBACK = "/brand/riva-emblem.svg";

/** Prefer API/admin upload; fall back to optional static file in public/menu/. */
export function resolveProductImage(product: {
  slug: string;
  image_url?: string | null;
}): string {
  if (product.image_url) return resolveImageUrl(product.image_url);
  return menuImagePath(product.slug);
}

export function isWineCategory(categorySlug: string): boolean {
  return categorySlug === "viner";
}
