import Link from "next/link";

import { PriceDisplay, ProductImage } from "@/components/features/menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { ProductDetail } from "@/lib/api";

interface ProductDetailProps {
  product: ProductDetail;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const groups = product.modifier_groups ?? [];

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <ProductImage
        src={product.image_url}
        alt={product.name}
        priority
        aspectRatio="portrait"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="lg:pt-4">
        <Link
          href="/meny"
          className="riva-label transition-riva hover:text-riva-cream"
        >
          {product.category_name}
        </Link>
        <h1 className="mt-3 font-display text-4xl text-riva-cream md:text-5xl">
          {product.name}
        </h1>
        {!product.is_available && (
          <Badge variant="soldOut" className="mt-4">
            Tillfälligt slut
          </Badge>
        )}
        {product.description && (
          <p className="mt-5 max-w-prose leading-relaxed text-riva-muted">
            {product.description}
          </p>
        )}
        <p className="mt-6">
          <PriceDisplay priceIncVat={product.pricing.price_inc_vat} size="lg" />
        </p>

        {groups.map((group) => (
          <div key={group.id} className="mt-8">
            <h2 className="riva-label">{group.name}</h2>
            <ul className="mt-3 space-y-2 border-t border-riva-cream/10 pt-3">
              {group.options.map((opt) => (
                <li
                  key={opt.id}
                  className="flex items-center justify-between text-sm text-riva-muted"
                >
                  <span>{opt.name}</span>
                  {Number(opt.price_delta) > 0 && (
                    <span className="tabular-nums text-riva-muted">
                      +{formatPrice(opt.pricing.price_inc_vat)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-10 flex flex-col gap-3 border-t border-riva-cream/10 pt-8 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/boka">Boka bord</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/meny">Tillbaka till menyn</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
