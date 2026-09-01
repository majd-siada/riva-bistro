import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface FoodCardProps {
  name: string;
  description?: string | null;
  priceIncVat: number | string;
  className?: string;
}

export function FoodCard({ name, description, priceIncVat, className }: FoodCardProps) {
  return (
    <div className={cn("riva-card p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl text-riva-cream">{name}</h3>
        <span className="riva-price shrink-0 text-base">{formatPrice(priceIncVat)}</span>
      </div>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-riva-muted">{description}</p>
      )}
    </div>
  );
}
