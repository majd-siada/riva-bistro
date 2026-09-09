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
 * True when the API returned at least one of the six public section shells.
 * Modern catalogs omit inactive sections; reinjecting them would break visibility.
 * Legacy flat catalogs (only Förrätter…Desserter) have none of these slugs.
 */
export function catalogHasAnyMenuSection(
  categories: Array<{ slug: string }>,
): boolean {
  return categories.some((c) => SECTION_SET.has(c.slug));
}

/**
 * Force the public hierarchy the site shows:
 * - six isolated top-level sections (legacy) OR only active sections (modern)
 * - Förrätter…Desserter nested only under RIVAS MENY
 *
 * Django Admin / Next admin owns name and sort_order for rows that already
 * exist in the API. Static top-level shells are only filled in for legacy flat
 * catalogs (no section slugs from the API), so deactivating a section in admin
 * removes it from the public Kategorier bar.
 */
export function isolateMenuHierarchy(categories: PublicCategory[]): PublicCategory[] {
  const bySlug = new Map<string, PublicCategory>();
  const fromCatalog = new Set<string>();

  for (const category of categories) {
    bySlug.set(category.slug, { ...category });
    fromCatalog.add(category.slug);
  }

  const isLegacyFlatCatalog = !catalogHasAnyMenuSection(categories);

  // Inject the six section shells only for legacy flat catalogs.
  // Modern catalogs: keep admin-active sections only (no reinjection of inactive).
  for (const section of staticMenu().categories.filter((c) => c.parentSlug == null)) {
    const existing = bySlug.get(section.slug);
    if (!existing) {
      if (isLegacyFlatCatalog) {
        bySlug.set(section.slug, { ...section });
      }
    } else if (fromCatalog.has(section.slug)) {
      bySlug.set(section.slug, {
        ...existing,
        parentSlug: null,
        name: existing.name.trim() ? existing.name : section.name,
      });
    } else if (isLegacyFlatCatalog) {
      bySlug.set(section.slug, {
        ...existing,
        parentSlug: null,
        sortOrder: section.sortOrder,
        name: existing.name.trim() ? existing.name : section.name,
      });
    }
  }

  // Ensure course categories exist and are always parented under rivas-meny.
  // Legacy flat catalogs get the full course set. Modern catalogs keep only
  // courses returned by the API (inactive courses stay hidden).
  for (const course of staticMenu().categories.filter((c) => c.parentSlug === "rivas-meny")) {
    const existing = bySlug.get(course.slug);
    if (!existing) {
      if (isLegacyFlatCatalog) {
        bySlug.set(course.slug, { ...course, parentSlug: "rivas-meny" });
      }
    } else if (fromCatalog.has(course.slug)) {
      bySlug.set(course.slug, {
        ...existing,
        parentSlug: "rivas-meny",
        name: existing.name.trim() ? existing.name : course.name,
      });
    } else if (isLegacyFlatCatalog) {
      bySlug.set(course.slug, {
        ...existing,
        parentSlug: "rivas-meny",
        sortOrder: course.sortOrder,
        name: existing.name.trim() ? existing.name : course.name,
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
    // Use API data whenever categories exist — empty product lists are valid
    // (e.g. TAKE AWAY / DRYCK shells with no dishes yet). Never invent dishes.
    if (!categories.length) {
      return {
        categories: isolateMenuHierarchy(staticMenu().categories),
        items: staticMenu().items,
      };
    }

    return {
      categories: isolateMenuHierarchy(categories.map(mapCategory)),
      items: products.map(mapProduct),
    };
  } catch {
    // Network / API failure only — last-resort static shells + seed dishes.
    return {
      categories: isolateMenuHierarchy(staticMenu().categories),
      items: staticMenu().items,
    };
  }
}

export async function loadFeaturedItems(): Promise<PublicItem[]> {
  try {
    const featured = await fetchFeatured();
    return featured.map(mapProduct);
  } catch {
    const { items } = staticMenu();
    const featuredSlugs = new Set<string>(FEATURED_MENU_SLUGS);
    return items.filter((item) => featuredSlugs.has(item.slug));
  }
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

/** Top nav: six sections; nest child categories when a section has any. */
export function buildMenuNav(
  categories: PublicCategory[],
): MenuNavEntry[] {
  return topLevelCategories(categories).map((section) => {
    const children = childCategories(categories, section.slug).map((c) => ({
      slug: c.slug,
      name: c.name,
    }));
    if (!children.length) {
      return { slug: section.slug, name: section.name };
    }
    return {
      slug: section.slug,
      name: section.name,
      children,
    };
  });
}

export type MenuPanelData = {
  slug: string;
  category: PublicCategory;
  items: PublicItem[];
  subsections?: Array<{ category: PublicCategory; items: PublicItem[] }>;
};

/**
 * One panel per top-level section. Sections with child categories get
 * subsections (and, for RIVAS MENY, also one panel per course so the browser
 * can show a single category at a time). Other sections keep flat item lists
 * when they have no children.
 */
export function buildMenuPanels(
  categories: PublicCategory[],
  items: PublicItem[],
): MenuPanelData[] {
  const panels: MenuPanelData[] = [];
  for (const section of topLevelCategories(categories)) {
    const children = childCategories(categories, section.slug);
    if (children.length > 0) {
      panels.push({
        slug: section.slug,
        category: section,
        items: itemsForCategory(items, section.slug),
        subsections: children.map((sub) => ({
          category: sub,
          items: itemsForCategory(items, sub.slug),
        })),
      });
      // Individual child panels (hash / chip navigation) — used by RIVAS MENY.
      for (const child of children) {
        panels.push({
          slug: child.slug,
          category: child,
          items: itemsForCategory(items, child.slug),
        });
      }
    } else {
      panels.push({
        slug: section.slug,
        category: section,
        items: itemsForCategory(items, section.slug),
      });
    }
  }
  return panels;
}
