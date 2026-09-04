import { FEATURED_MENU_SLUGS, MENU_CATEGORIES, MENU_ITEMS } from "@/data/menu";
import { fetchCategories, fetchFeatured, fetchProducts, resolveImageUrl, type Category, type Product } from "@/lib/api";

export type PublicCategory = { name: string; slug: string; description: string };
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
    categories: MENU_CATEGORIES.map((c) => ({ ...c })),
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

export async function loadPublicMenu(): Promise<{
  categories: PublicCategory[];
  items: PublicItem[];
}> {
  try {
    const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
    if (!categories.length || !products.length) return staticMenu();
    return {
      categories: categories.map((c: Category) => ({
        name: c.name,
        slug: c.slug,
        description: c.description ?? "",
      })),
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
