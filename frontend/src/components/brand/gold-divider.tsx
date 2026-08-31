import { cn } from "@/lib/utils";

interface GoldDividerProps {
  className?: string;
  variant?: "full" | "short";
}

export function GoldDivider({ className, variant = "full" }: GoldDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-px bg-gradient-to-r from-transparent via-riva-gold to-transparent",
        variant === "short" ? "w-16" : "w-full",
        className,
      )}
    />
  );
}
