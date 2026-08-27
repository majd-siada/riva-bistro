import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface PriceDisplayProps {
  priceIncVat: number | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({ priceIncVat, size = "md", className }: PriceDisplayProps) {
  const sizeClass = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <span className={cn("riva-price tabular-nums", sizeClass, className)}>
      {formatPrice(priceIncVat)}
    </span>
  );
}
