import { GoldDivider } from "@/components/brand/gold-divider";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface FeaturedDishProps {
  name: string;
  categoryName?: string;
  description?: string | null;
  priceIncVat: number | string;
  className?: string;
}

export function FeaturedDish({
  name,
  categoryName,
  description,
  priceIncVat,
  className,
}: FeaturedDishProps) {
  return (
    <article className={cn("max-w-2xl", className)}>
      {categoryName && <p className="riva-label">{categoryName}</p>}
      <h3 className="mt-4 font-display text-4xl text-riva-cream md:text-5xl">{name}</h3>
      <GoldDivider className="my-6 max-w-[120px]" variant="short" />
      {description && (
        <p className="max-w-prose text-pretty leading-relaxed text-riva-muted">{description}</p>
      )}
      <p className="riva-price mt-6 text-2xl">{formatPrice(priceIncVat)}</p>
    </article>
  );
}
