import Image from "next/image";

import { resolveImageUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: "square" | "portrait" | "wide";
  sizes?: string;
}

const aspectClasses = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  wide: "aspect-[16/10]",
};

export function ProductImage({
  src,
  alt,
  className,
  priority = false,
  aspectRatio = "portrait",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: ProductImageProps) {
  const resolved = resolveImageUrl(src ?? "");
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-riva-cream-2",
        aspectClasses[aspectRatio],
        className,
      )}
    >
      {resolved ? (
        <>
          <Image
            src={resolved}
            alt={alt}
            fill
            priority={priority}
            className="object-cover transition-transform duration-slow ease-out group-hover:scale-[1.04] motion-reduce:transform-none"
            sizes={sizes}
          />
          <div className="pointer-events-none absolute inset-0 bg-riva-image-fade opacity-0 transition-opacity group-hover:opacity-100" />
        </>
      ) : (
        <PlaceholderMark />
      )}
    </div>
  );
}

function PlaceholderMark() {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(94,139,139,0.10),transparent_60%)]"
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/riva-emblem.svg"
        alt=""
        className="h-16 w-16 opacity-30"
        width={64}
        height={64}
      />
    </div>
  );
}
