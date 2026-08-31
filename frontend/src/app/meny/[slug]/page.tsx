import { notFound } from "next/navigation";

import { GoldDivider } from "@/components/brand/gold-divider";
import { RestaurantImage } from "@/components/brand/restaurant-image";
import { PriceDisplay } from "@/components/features/menu";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { fetchProduct } from "@/lib/api";
import { isWineCategory, menuImagePath } from "@/lib/menu-images";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  try {
    const product = await fetchProduct(slug);
    return {
      title: product.name,
      description: product.description,
    };
  } catch {
    return { title: "Rätt hittades inte" };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product;
  try {
    product = await fetchProduct(slug);
  } catch {
    notFound();
  }

  const wine = isWineCategory(product.category_slug);

  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <RestaurantImage
          src={menuImagePath(slug)}
          alt={`${product.name} — ${product.description}`}
          aspectRatio="hero"
          priority
        />
        <div>
          <Link
            href="/meny"
            className="riva-label transition-riva hover:text-riva-gold-light"
          >
            {product.category_name}
          </Link>
          <h1 className="mt-4 font-display text-4xl text-riva-cream md:text-5xl">
            {product.name}
          </h1>
          <GoldDivider variant="short" className="my-6 opacity-60" />
          {product.description && (
            <p className="max-w-prose leading-relaxed text-riva-muted">{product.description}</p>
          )}
          <div className="mt-8 flex items-baseline gap-2">
            <PriceDisplay priceIncVat={product.pricing.price_inc_vat} size="lg" />
            {wine && <span className="text-sm text-riva-muted">/ glas</span>}
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="gold">
              <Link href="/boka">Boka bord</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/meny">Tillbaka till menyn</Link>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
