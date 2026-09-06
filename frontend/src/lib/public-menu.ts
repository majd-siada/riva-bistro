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

/** Top-level section slugs created by seed_menu_sections. */
export const MENU_SECTION_SLUGS = [
  "dagens-lunch",
  "rivas-meny",
  "take-away",
  "stora-sallskapsmeny",
  "snacks-drinkar",
  "dryck",
] as const;

/**
 * Course categories that always belong under RIVAS MENY — never as their own
 * top-level meny sections.
 */
export const RIVAS_MENY_COURSE_SLUGS = [
  "forratter",
  "varmratter",
  "sallader",
  "pasta",
  "barnmeny",
  "desserter",
] as const;

const RIVAS_COURSE_SET = new Set<string>(RIVAS_MENY_COURSE_SLUGS);
const SECTION_SET = new Set<string>(MENU_SECTION_SLUGS);

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

/**
 * True when the catalog already has the six public meny sections.
 * Older production DBs only have flat course categories (Förrätter, …).
 */
export function catalogHasMenuSections(
  categories: Array<{ slug: string; parentSlug?: string | null }>,
): boolean {
  const topSlugs = new Set(
    categories.filter((c) => c.parentSlug == null).map((c) => c.slug),
  );
  return MENU_SECTION_SLUGS.every((slug) => topSlugs.has(slug));
}

/**
 * Force the public hierarchy the site shows:
 * - six isolated top-level sections
 * - Förrätter…Desserter nested only under RIVAS MENY
 *
 * Merges missing section shells from the static catalog so a flat API
 * response cannot leak course categories into the top level.
 */
export function isolateMenuHierarchy(categories: PublicCategory[]): PublicCategory[] {
  const bySlug = new Map<string, PublicCategory>();

  for (const category of categories) {
    bySlug.set(category.slug, { ...category });
  }

  // Ensure the six section shells exist (names/order from static defaults).
  for (const section of staticMenu().categories.filter((c) => c.parentSlug == null)) {
    const existing = bySlug.get(section.slug);
    if (!existing) {
      bySlug.set(section.slug, { ...section });
    } else {
      bySlug.set(section.slug, {
        ...existing,
        parentSlug: null,
        sortOrder: section.sortOrder,
        name: existing.name || section.name,
      });
    }
  }

  // Ensure course categories exist and are always parented under rivas-meny.
  for (const course of staticMenu().categories.filter((c) => c.parentSlug === "rivas-meny")) {
    const existing = bySlug.get(course.slug);
    if (!existing) {
      bySlug.set(course.slug, { ...course, parentSlug: "rivas-meny" });
    } else {
      bySlug.set(course.slug, {
        ...existing,
        parentSlug: "rivas-meny",
        sortOrder: existing.sortOrder || course.sortOrder,
        name: existing.name || course.name,
        description: existing.description || course.description,
      });
    }
  }

  // Any leftover course slug from the API is pinned under rivas-meny.
  for (const [slug, category] of bySlug) {
    if (RIVAS_COURSE_SET.has(slug)) {
      category.parentSlug = "rivas-meny";
    } else if (SECTION_SET.has(slug)) {
      category.parentSlug = null;
    }
  }

  return [...bySlug.values()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug),
  );
}

export async function loadPublicMenu(): Promise<{
  categories: PublicCategory[];
  items: PublicItem[];
}> {
  try {
    const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
    if (!categories.length || !products.length) {
      return {
        categories: isolateMenuHierarchy(staticMenu().categories),
        items: staticMenu().items,
      };
    }

    const mappedCategories = categories.map(mapCategory);
    const mappedItems = products.map(mapProduct);

    // Flat production catalogs still win for dish data; hierarchy is isolated
    // onto the six sections + RIVAS MENY courses regardless of parent_slug.
    return {
      categories: isolateMenuHierarchy(mappedCategories),
      items: mappedItems,
    };
  } catch {
    return {
      categories: isolateMenuHierarchy(staticMenu().categories),
      items: staticMenu().items,
    };
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

/** Top-level sections only (never RIVAS MENY courses), ordered by sortOrder. */
export function topLevelCategories(categories: PublicCategory[]): PublicCategory[] {
  return categories
    .filter((c) => c.parentSlug == null && !RIVAS_COURSE_SET.has(c.slug))
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

export type MenuNavEntry = {
  slug: string;
  name: string;
  children?: Array<{ slug: string; name: string }>;
};

/** Sidebar/mobile nav: six sections, with RIVAS MENY courses nested underneath. */
export function buildMenuNav(
  categories: PublicCategory[],
): MenuNavEntry[] {
  return topLevelCategories(categories).map((section) => {
    if (section.slug !== "rivas-meny") {
      return { slug: section.slug, name: section.name };
    }
    return {
      slug: section.slug,
      name: section.name,
      children: childCategories(categories, section.slug).map((c) => ({
        slug: c.slug,
        name: c.name,
      })),
    };
  });
}
