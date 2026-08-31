import Link from "next/link";

import { RestaurantImage } from "@/components/brand/restaurant-image";
import { SectionHeading } from "@/components/brand/section-heading";
import { FeaturedDish } from "@/components/commerce/featured-dish";
import { FoodCard } from "@/components/commerce/food-card";
import { MenuCategoryNav } from "@/components/commerce/menu-category-nav";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { fetchCategories, fetchProducts, type Category, type Product } from "@/lib/api";

export const metadata = {
  title: "Meny",
  description: "Utforska Riva Bistros meny — förrätter, varmrätter, pasta, sallader och mer.",
};

export default async function MenuPage() {
  let categories: Category[] = [];
  let products: Product[] = [];
  try {
    [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
  } catch {
    categories = [];
    products = [];
  }

  const byCategory = categories.map((cat) => ({
    ...cat,
    items: products.filter((p) => p.category_slug === cat.slug),
  }));

  const varm = products.filter((p) => p.category_slug === "varmratter");
  const featuredMain = varm.find((p) => p.slug === "entrecote") ?? varm[0];

  return (
    <>
      <section className="relative overflow-hidden bg-riva-black">
        <div className="mx-auto grid max-w-7xl items-end gap-8 px-5 py-16 md:grid-cols-2 md:px-8 md:py-20">
          <div>
            <p className="riva-label">Mat &amp; dryck</p>
            <h1 className="mt-4 font-display text-5xl text-riva-cream md:text-6xl">Meny</h1>
            <p className="mt-4 max-w-md text-riva-muted">
              Säsongens råvaror, tillagade med omsorg. Alla priser inklusive moms.
            </p>
          </div>
          <RestaurantImage
            src="/scenes/menu-tabletop.jpg"
            alt="Upplagd middag på mörk tabletop — Riva Bistro"
            aspectRatio="wide"
            priority
          />
        </div>
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[220px_1fr] xl:grid-cols-[260px_1fr]">
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <MenuCategoryNav
                categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
              />
            </div>
          </div>

          <div className="min-w-0 space-y-16">
            <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-2 lg:hidden">
              {categories.map((cat) => (
                <a
                  key={cat.slug}
                  href={`#${cat.slug}`}
                  className="shrink-0 rounded-full border border-riva-gold/30 px-4 py-2 text-sm text-riva-cream"
                >
                  {cat.name}
                </a>
              ))}
            </div>

            {featuredMain && (
              <div id="varmratter">
                <SectionHeading eyebrow="Utvalt" title="Varmrätter" />
                <FeaturedDish product={featuredMain} className="mt-10" reverse />
                <div className="mt-8 text-right">
                  <Button asChild variant="link">
                    <Link href="#varmratter-grid">Visa alla →</Link>
                  </Button>
                </div>
              </div>
            )}

            {byCategory.map((cat) => (
              <section key={cat.slug} id={cat.slug === "varmratter" ? "varmratter-grid" : cat.slug}>
                <SectionHeading title={cat.name} description={cat.description} />
                {cat.items.length > 0 ? (
                  <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {cat.items.map((item) => (
                      <FoodCard key={item.id} product={item} />
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 text-riva-muted">Inga rätter i denna kategori just nu.</p>
                )}
              </section>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
