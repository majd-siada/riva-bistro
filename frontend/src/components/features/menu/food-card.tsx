import Link from "next/link";

import { RestaurantImage } from "@/components/brand/restaurant-image";
import { formatPrice } from "@/lib/format";
import { isWineCategory, resolveProductImage } from "@/lib/menu-images";
import type { Product } from "@/lib/api";
import { cn } from "@/lib/utils";

interface FoodCardProps {
  product: Product;
  className?: string;
}

export function FoodCard({ product, className }: FoodCardProps) {
  const wine = isWineCategory(product.category_slug);

  return (
    <Link
      href={`/meny/${product.slug}`}
      className={cn("group riva-card block overflow-hidden", className)}
    >
      <RestaurantImage
        src={resolveProductImage(product)}
        alt={`${product.name} — ${product.description || "Riva Bistro"}`}
        aspectRatio="wide"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="space-y-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl text-riva-cream transition-riva group-hover:text-riva-gold-light">
            {product.name}
          </h3>
          <span className="riva-price shrink-0 text-base">
            {formatPrice(product.pricing.price_inc_vat)}
            {wine && <span className="text-xs font-normal text-riva-muted"> / glas</span>}
          </span>
        </div>
        {product.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-riva-muted">
            {product.description}
          </p>
        )}
      </div>
    </Link>
  );
}
