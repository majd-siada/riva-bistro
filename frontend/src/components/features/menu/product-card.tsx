import Link from "next/link";

import { PriceDisplay, ProductImage } from "@/components/features/menu";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/meny/${product.slug}`}
      className="group flex flex-col rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-riva-gold focus-visible:ring-offset-2 focus-visible:ring-offset-riva-black"
    >
      <ProductImage src={product.image_url} alt={product.name} aspectRatio="portrait" />
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xl text-riva-cream transition-riva group-hover:text-riva-gold">
          {product.name}
        </h3>
        <PriceDisplay priceIncVat={product.pricing.price_inc_vat} size="md" />
      </div>
      {product.description && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-riva-muted">
          {product.description}
        </p>
      )}
      {!product.is_available && (
        <Badge variant="soldOut" className="mt-3 w-fit">
          Tillfälligt slut
        </Badge>
      )}
    </Link>
  );
}
