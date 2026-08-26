import Link from "next/link";

import { PriceDisplay } from "@/components/commerce/price-display";
import { ProductImage } from "@/components/commerce/product-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/meny/${product.slug}`} className="group block">
      <Card className="overflow-hidden border-riva-ivory/10 bg-riva-charcoal transition-riva hover:border-riva-teal/30">
        {product.image_url && (
          <ProductImage src={product.image_url} alt={product.name} aspectRatio="cinematic" />
        )}
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-riva-gold">{product.category_name}</p>
              <h3 className="mt-1 font-display text-xl text-riva-ivory group-hover:text-riva-teal transition-riva">
                {product.name}
              </h3>
            </div>
            {!product.is_available && <Badge variant="soldOut">Slut</Badge>}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-riva-mist">{product.description}</p>
          <div className="mt-4">
            <PriceDisplay priceIncVat={product.pricing.price_inc_vat} showVatNote size="sm" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
