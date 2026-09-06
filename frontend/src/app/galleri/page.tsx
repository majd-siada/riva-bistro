import { RestaurantImage } from "@/components/brand/restaurant-image";
import { Section } from "@/components/layout/section";
import { loadGallery } from "@/lib/public-data";

import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Galleri",
  absoluteTitle: "Galleri — Riva Bistro Kungsholmen",
  description:
    "Bilder från Riva Bistro på Kungsholmen — matsalen, köket och stämningen vid Hornsbergs Strand.",
  path: "/galleri",
});

export default async function GalleryPage() {
  const items = await loadGallery();

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <p className="riva-label">Atmosfär</p>
        <h1 className="mt-4 font-display text-5xl text-riva-cream md:text-6xl">Galleri</h1>
        <p className="mt-4 max-w-md text-riva-muted">
          Ett urval från rummet och tallriken. Fler bilder läggs till när vi fotograferar säsongen.
        </p>
      </section>
      <Section>
        {items.length === 0 ? (
          <p className="text-riva-muted">Galleriet fylls på. Välkommen in och se rummet live.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <figure key={item.id}>
                <RestaurantImage src={item.src} alt={item.alt} aspectRatio="wide" />
                {item.title ? (
                  <figcaption className="mt-3 text-sm text-riva-muted">{item.title}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
