import { FEATURED_MENU_SLUGS, MENU_CATEGORIES, MENU_ITEMS } from "@/data/menu";
import {
  fetchCategories,
  fetchFeatured,
  fetchProducts,
  resolveImageUrl,
  type Category,
  type Product,
} from "@/lib/api";

export type PublicCategory = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  parentSlug: string | null;
};

export type PublicItem = {
  categorySlug: string;
  name: string;
  slug: string;
  description: string;
  priceIncVat: number | string;
  imageUrl?: string;
};

function staticMenu() {
  return {
    categories: MENU_CATEGORIES.map((c) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      sortOrder: c.sortOrder,
      parentSlug: c.parentSlug,
    })),
    items: MENU_ITEMS.map((item) => ({
      categorySlug: item.categorySlug,
      name: item.name,
      slug: item.slug,
      description: item.description,
      priceIncVat: item.priceIncVat,
    })),
  };
}

function mapProduct(p: Product): PublicItem {
  return {
    categorySlug: p.category_slug,
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    priceIncVat: p.pricing.price_inc_vat,
    imageUrl: p.image_url ? resolveImageUrl(p.image_url) : undefined,
  };
}

function mapCategory(c: Category): PublicCategory {
  return {
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    sortOrder: c.sort_order ?? 0,
    parentSlug: c.parent_slug ?? null,
  };
}

export async function loadPublicMenu(): Promise<{
  categories: PublicCategory[];
  items: PublicItem[];
}> {
  try {
    const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
    if (!categories.length || !products.length) return staticMenu();
    return {
      categories: categories
        .map(mapCategory)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug)),
      items: products.map(mapProduct),
    };
  } catch {
    return staticMenu();
  }
}

export async function loadFeaturedItems(): Promise<PublicItem[]> {
  try {
    const featured = await fetchFeatured();
    if (featured.length) {
      return featured.map(mapProduct);
    }
  } catch {
    /* fall through */
  }
  const { items } = staticMenu();
  const featuredSlugs = new Set<string>(FEATURED_MENU_SLUGS);
  return items.filter((item) => featuredSlugs.has(item.slug));
}

/** Top-level sections only, ordered by sortOrder. */
export function topLevelCategories(categories: PublicCategory[]): PublicCategory[] {
  return categories
    .filter((c) => c.parentSlug == null)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
}

/** Children of a section, ordered by sortOrder. */
export function childCategories(
  categories: PublicCategory[],
  parentSlug: string,
): PublicCategory[] {
  return categories
    .filter((c) => c.parentSlug === parentSlug)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
}

export function itemsForCategory(items: PublicItem[], categorySlug: string): PublicItem[] {
  return items.filter((item) => item.categorySlug === categorySlug);
}

/** True when the section has direct dishes or a child course with dishes. */
export function sectionHasContent(
  section: PublicCategory,
  categories: PublicCategory[],
  items: PublicItem[],
): boolean {
  if (itemsForCategory(items, section.slug).length > 0) return true;
  return childCategories(categories, section.slug).some(
    (child) => itemsForCategory(items, child.slug).length > 0,
  );
}

/** Public meny: hide empty shells (e.g. TAKE AWAY before dishes are added). */
export function visibleTopLevelSections(
  categories: PublicCategory[],
  items: PublicItem[],
): PublicCategory[] {
  return topLevelCategories(categories).filter((section) =>
    sectionHasContent(section, categories, items),
  );
}
