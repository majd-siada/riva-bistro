import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-wide transition-riva focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riva-gold focus-visible:ring-offset-2 focus-visible:ring-offset-riva-cream disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-riva-ink text-riva-ivory hover:bg-riva-ink-soft",
        gold: "bg-riva-gold text-riva-ink hover:bg-[color-mix(in_srgb,var(--riva-gold)_88%,black)]",
        teal: "bg-riva-teal text-on-dark hover:bg-[color-mix(in_srgb,var(--riva-teal)_88%,black)]",
        outline:
          "border border-riva-ink/25 bg-transparent text-riva-ink hover:border-riva-ink/60 hover:bg-riva-ink/[0.03]",
        ghost: "text-riva-ink hover:bg-riva-ink/[0.06]",
        link: "text-riva-teal underline-offset-4 hover:underline",
        destructive: "bg-riva-error text-white hover:bg-[color-mix(in_srgb,var(--riva-error)_88%,black)]",
        "outline-light":
          "border border-on-dark/40 bg-transparent text-on-dark hover:bg-on-dark/10",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-[0.95rem]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
