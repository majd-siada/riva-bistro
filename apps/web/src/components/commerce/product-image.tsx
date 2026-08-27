import Image from "next/image";

import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: "square" | "cinematic" | "wide";
}

const aspectClasses = {
  square: "aspect-square",
  cinematic: "aspect-[4/5]",
  wide: "aspect-[16/9]",
};

export function ProductImage({
  src,
  alt,
  className,
  priority = false,
  aspectRatio = "cinematic",
}: ProductImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-riva-charcoal-deep",
        aspectClasses[aspectRatio],
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover transition-transform duration-normal ease-out hover:scale-[1.03] group-hover:scale-[1.03] motion-reduce:transform-none"
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-riva-warm-overlay opacity-60" />
    </div>
  );
}
