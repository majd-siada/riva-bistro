"use client";

import Image from "next/image";
import { useState } from "react";

import { MENU_IMAGE_FALLBACK } from "@/lib/menu-images";
import { cn } from "@/lib/utils";

interface RestaurantImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: "square" | "portrait" | "wide" | "hero" | "fill";
  sizes?: string;
}

const aspectClasses = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  wide: "aspect-[16/10]",
  hero: "aspect-[4/5] md:aspect-[5/6]",
  fill: "h-full w-full min-h-full",
};

export function RestaurantImage({
  src,
  alt,
  className,
  priority = false,
  aspectRatio = "wide",
  sizes = "(max-width: 768px) 100vw, 50vw",
}: RestaurantImageProps) {
  const [failed, setFailed] = useState(false);
  const imageSrc = failed ? MENU_IMAGE_FALLBACK : src;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg bg-riva-card",
        aspectClasses[aspectRatio],
        className,
      )}
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill
        priority={priority}
        unoptimized={imageSrc.endsWith(".svg")}
        className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.03] motion-reduce:transform-none"
        sizes={sizes}
        onError={() => setFailed(true)}
      />
      <div className="pointer-events-none absolute inset-0 bg-riva-scene-veil opacity-60" />
    </div>
  );
}
