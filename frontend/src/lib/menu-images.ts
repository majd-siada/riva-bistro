/** Frontend menu image convention: /menu/<slug>.jpg in public/. */

export function menuImagePath(slug: string): string {
  return `/menu/${slug}.jpg`;
}

export const MENU_IMAGE_FALLBACK = "/brand/riva-emblem.svg";

export function isWineCategory(categorySlug: string): boolean {
  return categorySlug === "viner";
}
