import Link from "next/link";

import { PriceDisplay } from "@/components/commerce/price-display";
import { ProductImage } from "@/components/commerce/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/api";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const groups = product.modifier_groups ?? [];

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {product.image_url && (
        <ProductImage
          src={product.image_url}
          alt={product.name}
          priority
          aspectRatio="cinematic"
        />
      )}
      <div>
        <p className="riva-label">{product.category_name}</p>
        <h1 className="mt-2 font-display text-4xl text-riva-ivory md:text-5xl">
          {product.name}
        </h1>
        {!product.is_available && (
          <Badge variant="soldOut" className="mt-4">
            Tillfälligt slut
          </Badge>
        )}
        <p className="mt-4 text-riva-mist">{product.description}</p>
        <div className="mt-6">
          <PriceDisplay
            priceIncVat={product.pricing.price_inc_vat}
            priceExVat={product.pricing.price_ex_vat}
            vatAmount={product.pricing.vat_amount}
            showVatNote
            size="lg"
          />
        </div>

        {groups.map((group) => (
          <div key={group.id} className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-riva-ivory">
              {group.name}
            </h2>
            <ul className="mt-3 space-y-2">
              {group.options.map((opt) => (
                <li
                  key={opt.id}
                  className="flex items-center justify-between text-sm text-riva-mist"
                >
                  <span>{opt.name}</span>
                  {Number(opt.price_delta) > 0 && (
                    <span className="tabular-nums">
                      +{formatPrice(opt.pricing.price_inc_vat)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <Separator className="my-8" />

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/meny">Tillbaka till menyn</Link>
          </Button>
          <Button asChild>
            <Link href="/boka">Boka bord</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
