import { RestaurantImage } from "@/components/brand/restaurant-image";
import { MenuBrowser } from "@/components/features/menu/menu-browser";
import { Section } from "@/components/layout/section";
import {
  buildMenuNav,
  buildMenuPanels,
  loadPublicMenu,
} from "@/lib/public-menu";

import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Meny",
  absoluteTitle: "Meny — Riva Bistro Kungsholmen",
  description:
    "Se menyn på Riva Bistro, Kungsholmen — lunch, middag, take away, sällskap och dryck. Alla priser inklusive moms.",
  path: "/meny",
});

export const dynamic = "force-static";
export const revalidate = 60;

export default async function MenuPage() {
  const { categories, items } = await loadPublicMenu();
  const nav = buildMenuNav(categories);
  const panels = buildMenuPanels(categories, items);
  const defaultSlug =
    panels.find((p) => p.slug === "rivas-meny")?.slug ??
    panels[0]?.slug ??
    "dagens-lunch";

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

      <Section as="div">
        <MenuBrowser nav={nav} panels={panels} defaultSlug={defaultSlug} />
      </Section>
    </>
  );
}
