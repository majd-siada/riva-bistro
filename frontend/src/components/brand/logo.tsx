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
}: LogoProps) {
  const wordColor = tone === "gold" ? "text-riva-gold" : "text-riva-cream";
  const subColor = "text-riva-muted";

  return (
    <span className={cn("inline-flex flex-col", className)}>
      {showWordmark && (
        <span className="flex flex-col leading-none">
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
        </span>
      )}
      {showDivider && showWordmark && (
        <GoldDivider variant="short" className="mt-2.5 opacity-70" />
      )}
    </span>
  );
}
