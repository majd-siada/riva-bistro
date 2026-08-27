import Link from "next/link";
import type { Metadata } from "next";

import { WaveDivider } from "@/components/brand/wave-divider";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { StateMessage } from "@/components/ui/state-message";
import { formatPrice } from "@/lib/format";
import { fetchCategories, fetchProducts, type Category, type Product } from "@/lib/api";

export const metadata: Metadata = {
  title: "Meny",
  description:
    "Riva Bistros meny — varmrätter, sallader, pasta, barnmeny och desserter. Alla priser inklusive moms.",
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

  const byCategory = categories
    .map((c) => ({
      category: c,
      items: products.filter((p) => p.category_slug === c.slug),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Section className="pt-16 md:pt-20">
      <header className="mx-auto max-w-2xl text-center">
        <p className="riva-label">Mat &amp; dryck</p>
        <h1 className="mt-3 font-display text-5xl text-riva-ink md:text-6xl">Menyn</h1>
        <WaveDivider className="mx-auto mt-6 max-w-[200px]" />
        <p className="mt-5 text-riva-taupe">Alla priser anges inklusive moms.</p>
      </header>

      {byCategory.length === 0 ? (
        <StateMessage
          variant="empty"
          title="Menyn är inte tillgänglig just nu"
          description="Vi uppdaterar menyn. Försök gärna igen om en liten stund."
          className="mx-auto mt-12 max-w-xl"
        />
      ) : (
        <>
          <nav
            aria-label="Menykategorier"
            className="sticky top-[73px] z-30 mt-10 -mx-5 flex gap-2 overflow-x-auto border-y border-riva-ink/10 bg-riva-cream/90 px-5 py-3 backdrop-blur-md md:mx-0 md:rounded-md md:border md:px-4"
          >
            {byCategory.map(({ category }) => (
              <a
                key={category.slug}
                href={`#${category.slug}`}
                className="whitespace-nowrap rounded-full px-4 py-1.5 text-sm text-riva-ink-soft transition-riva hover:bg-riva-ink/[0.06] hover:text-riva-ink"
              >
                {category.name}
              </a>
            ))}
          </nav>

          <div className="mt-16 space-y-20">
            {byCategory.map(({ category, items }) => (
              <section key={category.slug} id={category.slug} className="scroll-mt-32">
                <div className="reveal">
                  <h2 className="font-display text-3xl text-riva-ink md:text-4xl">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="mt-2 max-w-prose text-riva-taupe">{category.description}</p>
                  )}
                  <WaveDivider className="mt-5 max-w-[120px]" variant="gold" />
                </div>
                <ul className="reveal mt-8 grid gap-x-14 gap-y-7 md:grid-cols-2">
                  {items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/meny/${item.slug}`}
                        className="group block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-riva-gold focus-visible:ring-offset-4 focus-visible:ring-offset-riva-cream"
                      >
                        <div className="flex items-baseline gap-3">
                          <h3 className="font-display text-xl text-riva-ink transition-riva group-hover:text-riva-teal">
                            {item.name}
                          </h3>
                          <span
                            className="mb-1 flex-1 border-b border-dotted border-riva-ink/20"
                            aria-hidden="true"
                          />
                          <span className="riva-price tabular-nums text-lg">
                            {formatPrice(item.pricing.price_inc_vat)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                          {item.description && (
                            <p className="text-sm leading-relaxed text-riva-taupe">
                              {item.description}
                            </p>
                          )}
                          {!item.is_available && <Badge variant="soldOut">Slut</Badge>}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}
