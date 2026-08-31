import Link from "next/link";

import { GoldDivider } from "@/components/brand/gold-divider";
import { RestaurantImage } from "@/components/brand/restaurant-image";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { isWineCategory, resolveProductImage } from "@/lib/menu-images";
import type { Product } from "@/lib/api";
import { cn } from "@/lib/utils";

interface FeaturedDishProps {
  product: Product;
  className?: string;
  reverse?: boolean;
}

export function FeaturedDish({ product, className, reverse }: FeaturedDishProps) {
  const wine = isWineCategory(product.category_slug);

  return (
    <article
      className={cn(
        "grid items-center gap-8 md:grid-cols-2 md:gap-14",
        reverse && "md:[&>*:first-child]:order-2",
        className,
      )}
    >
      <RestaurantImage
        src={resolveProductImage(product)}
        alt={`${product.name} — utvald rätt på Riva Bistro`}
        aspectRatio="hero"
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div>
        <p className="riva-label">{product.category_name}</p>
        <h3 className="mt-4 font-display text-4xl text-riva-cream md:text-5xl">
          {product.name}
        </h3>
        <GoldDivider className="my-6 max-w-[120px]" variant="short" />
        {product.description && (
          <p className="max-w-prose text-pretty leading-relaxed text-riva-muted">
            {product.description}
          </p>
        )}
        <p className="riva-price mt-6 text-2xl">
          {formatPrice(product.pricing.price_inc_vat)}
          {wine && <span className="text-sm font-normal text-riva-muted"> / glas</span>}
        </p>
        <Button asChild variant="outline" className="mt-8 border-riva-gold/40 text-riva-gold hover:bg-riva-gold/10">
          <Link href={`/meny/${product.slug}`}>Läs mer</Link>
        </Button>
      </div>
    </article>
  );
}
