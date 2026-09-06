"use client";

import Image from "next/image";

import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface FoodCardProps {
  name: string;
  description?: string | null;
  priceIncVat: number | string;
  imageSrc?: string;
  className?: string;
}

export function FoodCard({
  name,
  description,
  priceIncVat,
  imageSrc,
  className,
}: FoodCardProps) {
  return (
    <div className={cn("riva-card overflow-hidden", className)}>
      {imageSrc ? (
        <div className="relative aspect-[16/10] bg-riva-surface">
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-xl text-riva-cream">{name}</p>
          <span className="riva-price shrink-0 text-base">{formatPrice(priceIncVat)}</span>
        </div>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-riva-muted">{description}</p>
        )}
      </div>
    </div>
  );
}
