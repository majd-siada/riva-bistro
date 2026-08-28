import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface PriceDisplayProps {
  priceIncVat: number | string;
  priceExVat?: number | string;
  vatAmount?: number | string;
  currency?: string;
  size?: "sm" | "md" | "lg";
  showVatNote?: boolean;
  className?: string;
}

const formatAmount = formatPrice;

export function PriceDisplay({
  priceIncVat,
  priceExVat,
  vatAmount,
  currency = "SEK",
  size = "md",
  showVatNote = false,
  className,
}: PriceDisplayProps) {
  const sizeClass =
    size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div className={cn("space-y-0.5", className)}>
      <p className={cn("riva-price font-semibold tabular-nums", sizeClass)}>
        {formatAmount(priceIncVat, currency)}
        {showVatNote && (
          <span className="ml-1 text-xs font-normal text-riva-mist">inkl. moms</span>
        )}
      </p>
      {priceExVat !== undefined && vatAmount !== undefined && (
        <p className="text-xs text-riva-mist tabular-nums">
          {formatAmount(priceExVat, currency)} exkl. moms · moms {formatAmount(vatAmount, currency)}
        </p>
      )}
    </div>
  );
}
