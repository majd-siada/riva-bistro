import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide transition-riva",
  {
    variants: {
      variant: {
        default: "border-riva-teal/40 bg-riva-teal/10 text-riva-teal",
        gold: "border-riva-gold/40 bg-riva-gold/10 text-riva-gold",
        secondary: "border-riva-ivory/20 bg-riva-ivory/5 text-riva-mist",
        available: "border-riva-success/40 bg-riva-success/10 text-riva-success",
        soldOut: "border-riva-error/40 bg-riva-error/10 text-riva-error",
        preparing: "border-riva-gold/40 bg-riva-gold/10 text-riva-gold",
        delivered: "border-riva-success/40 bg-riva-success/10 text-riva-success",
        vat: "border-transparent bg-transparent text-riva-mist normal-case tracking-normal font-normal",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
