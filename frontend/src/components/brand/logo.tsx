import Image from "next/image";

import { GoldDivider } from "@/components/brand/gold-divider";
import { cn } from "@/lib/utils";

interface LogoProps {
  tone?: "light" | "gold";
  showDivider?: boolean;
  showWordmark?: boolean;
  className?: string;
  size?: number;
}

export function Logo({
  tone = "light",
  showDivider = true,
  showWordmark = true,
  className,
  size = 40,
}: LogoProps) {
  const wordColor = tone === "gold" ? "text-riva-gold" : "text-riva-cream";
  const subColor = "text-riva-muted";

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/brand/riva-logo.svg"
        alt={showWordmark ? "" : "Riva Bistro"}
        width={size}
        height={size}
        className="shrink-0"
        priority
      />
      {showWordmark && (
        <span className="inline-flex flex-col leading-none">
          <span className={cn("font-display text-[1.65rem] tracking-[0.28em]", wordColor)}>
            RIVA
          </span>
          <span
            className={cn(
              "mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.55em]",
              subColor,
            )}
          >
            BISTRO
          </span>
          {showDivider && (
            <GoldDivider variant="short" className="mt-2.5 opacity-70" />
          )}
        </span>
      )}
    </span>
  );
}
