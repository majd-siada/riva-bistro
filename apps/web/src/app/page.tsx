import Link from "next/link";

import { WaveDivider } from "@/components/brand/wave-divider";
import { ProductCard } from "@/components/commerce/product-card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";
import { fetchProducts } from "@/lib/api";

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof fetchProducts>> = [];
  try {
    const all = await fetchProducts();
    featured = all.slice(0, 3);
  } catch {
    featured = [];
  }

  return (
    <>
      <section className="relative flex min-h-[90svh] items-center justify-center bg-riva-hero px-6 pt-20">
        <div className="mx-auto max-w-4xl text-center animate-fade-in">
          <p className="riva-label mb-4">Stockholm · Kust &amp; kök</p>
          <h1 className="font-display text-5xl font-medium text-riva-ivory md:text-7xl">
            Riva Bistro
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-riva-ivory/75 md:text-lg">
            Premium svensk gastronomi med mediterran själ. Beställ online eller boka bord för en
            kväll vid vattnet.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/meny">
              <Button size="lg">Beställ från menyn</Button>
            </Link>
            <Link href="/boka">
              <Button size="lg" variant="outline">
                Boka bord
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Section>
        <div className="text-center">
          <p className="riva-label">Utvalt</p>
          <h2 className="mt-2 font-display text-4xl text-riva-ivory">Säsongens favoriter</h2>
          <WaveDivider className="mx-auto mt-6 max-w-xs" />
        </div>
        {featured.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-riva-mist">
            Menyn laddas snart — starta backend med Docker Compose.
          </p>
        )}
        <div className="mt-12 text-center">
          <Link href="/meny">
            <Button variant="outline">Se hela menyn</Button>
          </Link>
        </div>
      </Section>

      <Section className="bg-riva-charcoal">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl text-riva-ivory md:text-4xl">
            Elegans vid vattnet
          </h2>
          <p className="mt-4 text-riva-ivory/70">
            Skandinavisk minimalism möter varm mediterran gästfrihet. Varje rätt tillagad med
            omsorg, serverad med sjöutsikt.
          </p>
          <Link href="/om-oss">
            <Button variant="link" className="mt-6">
              Läs mer om oss
            </Button>
          </Link>
        </div>
      </Section>
    </>
  );
}
