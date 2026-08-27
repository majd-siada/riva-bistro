import Image from "next/image";

import { cn } from "@/lib/utils";

interface LogoProps {
  tone?: "ink" | "light";
  showWordmark?: boolean;
  className?: string;
  size?: number;
}

export function Logo({ tone = "ink", showWordmark = true, className, size = 40 }: LogoProps) {
  const wordColor = tone === "light" ? "text-on-dark" : "text-riva-ink";
  const subColor = tone === "light" ? "text-on-dark-muted" : "text-riva-gold";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/brand/riva-emblem.svg"
        alt=""
        width={size}
        height={size}
        priority
        unoptimized
        style={{ height: size, width: size }}
      />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display text-2xl tracking-[0.14em]", wordColor)}>RIVA</span>
          <span
            className={cn(
              "mt-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.4em]",
              subColor,
            )}
          >
            Bistro
          </span>
        </span>
      )}
    </span>
  );
}
