import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        neutral: "border-riva-ink/15 bg-riva-ink/[0.04] text-riva-ink-soft",
        available: "border-riva-success/30 bg-riva-success/10 text-riva-success",
        soldOut: "border-riva-error/30 bg-riva-error/10 text-riva-error",
        gold: "border-riva-gold/40 bg-riva-gold/10 text-riva-gold",
        teal: "border-riva-teal/30 bg-riva-teal/10 text-riva-teal",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
