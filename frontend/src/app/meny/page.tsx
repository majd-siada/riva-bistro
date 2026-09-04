import { RestaurantImage } from "@/components/brand/restaurant-image";
import { SectionHeading } from "@/components/brand/section-heading";
import { FoodCard, MenuCategoryNav } from "@/components/features/menu";
import { Section } from "@/components/layout/section";
import { loadPublicMenu } from "@/lib/public-menu";

export const metadata = {
  title: "Meny",
  description:
    "Riva Bistros meny — varmrätter, sallader, pasta, barnmeny och desserter. Alla priser inklusive moms.",
};

export default async function MenuPage() {
  const { categories, items } = await loadPublicMenu();
  const byCategory = categories.map((category) => ({
    ...category,
    items: items.filter((item) => item.categorySlug === category.slug),
  }));

  return (
    <>
      <section className="relative overflow-hidden bg-riva-black">
        <div className="mx-auto grid max-w-7xl items-end gap-8 px-5 py-16 md:grid-cols-2 md:px-8 md:py-20">
          <div>
            <p className="riva-label">Mat &amp; dryck</p>
            <h1 className="mt-4 font-display text-5xl text-riva-cream md:text-6xl">Meny</h1>
            <p className="mt-4 max-w-md text-riva-muted">
              Säsongens råvaror, tillagade med omsorg. Alla priser inklusive moms (12 % på mat).
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

            {byCategory.map((cat) => (
              <section key={cat.slug} id={cat.slug}>
                <SectionHeading title={cat.name} description={cat.description} />
                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {cat.items.map((item) => (
                    <FoodCard
                      key={item.slug}
                      name={item.name}
                      description={item.description}
                      priceIncVat={item.priceIncVat}
                      imageSrc={item.imageUrl}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
