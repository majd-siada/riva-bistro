import { RestaurantImage } from "@/components/brand/restaurant-image";
import { MenuCategoryNav } from "@/components/features/menu";
import {
  MENU_SECTION_REGISTRY,
  MenuSection,
} from "@/components/features/menu/sections";
import { Section } from "@/components/layout/section";
import {
  childCategories,
  itemsForCategory,
  loadPublicMenu,
  visibleTopLevelSections,
} from "@/lib/public-menu";

export const metadata = {
  title: "Meny",
  description:
    "Riva Bistros meny — dagens lunch, RIVAS MENY, take away, sällskap, snacks och dryck. Alla priser inklusive moms.",
};

export default async function MenuPage() {
  const { categories, items } = await loadPublicMenu();
  const sections = visibleTopLevelSections(categories, items);

  const navCategories = sections.flatMap((section) => {
    if (section.slug === "rivas-meny") {
      const courses = childCategories(categories, section.slug).filter(
        (c) => itemsForCategory(items, c.slug).length > 0,
      );
      return [
        { slug: section.slug, name: section.name },
        ...courses.map((c) => ({ slug: c.slug, name: c.name })),
      ];
    }
    return [{ slug: section.slug, name: section.name }];
  });

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
              <MenuCategoryNav categories={navCategories} />
            </div>
          </div>

          <div className="min-w-0 space-y-16">
            <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-2 lg:hidden">
              {navCategories.map((cat) => (
                <a
                  key={cat.slug}
                  href={`#${cat.slug}`}
                  className="shrink-0 rounded-full border border-riva-gold/30 px-4 py-2 text-sm text-riva-cream"
                >
                  {cat.name}
                </a>
              ))}
            </div>

            {sections.map((section) => {
              const SectionComponent =
                MENU_SECTION_REGISTRY[section.slug] ?? MenuSection;
              const subsections =
                section.slug === "rivas-meny"
                  ? childCategories(categories, section.slug)
                      .map((sub) => ({
                        category: sub,
                        items: itemsForCategory(items, sub.slug),
                      }))
                      .filter((sub) => sub.items.length > 0)
                  : undefined;
              const directItems =
                section.slug === "rivas-meny"
                  ? []
                  : itemsForCategory(items, section.slug);

              return (
                <SectionComponent
                  key={section.slug}
                  category={section}
                  items={directItems}
                  subsections={subsections}
                />
              );
            })}
          </div>
        </div>
      </Section>
    </>
  );
}
