import { cn } from "@/lib/utils";

interface WaveDividerProps {
  className?: string;
  variant?: "default" | "subtle" | "gold";
}

export function WaveDivider({ className, variant = "default" }: WaveDividerProps) {
  const strokeClass =
    variant === "gold"
      ? "stroke-riva-gold/40"
      : variant === "subtle"
        ? "stroke-riva-gold/20"
        : "stroke-riva-gold/40";

  return (
    <svg
      aria-hidden="true"
      className={cn("h-3 w-full", className)}
      viewBox="0 0 400 12"
      fill="none"
      preserveAspectRatio="none"
    >
      <path
        d="M0 6C50 2 100 10 150 6C200 2 250 10 300 6C350 2 400 10 400 6"
        className={cn(strokeClass, "fill-none")}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
