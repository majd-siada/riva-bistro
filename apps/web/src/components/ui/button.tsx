import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium tracking-wide transition-riva focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riva-gold focus-visible:ring-offset-2 focus-visible:ring-offset-riva-black disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-riva-gold text-riva-black hover:bg-riva-gold-light",
        gold: "bg-riva-gold text-riva-black hover:bg-riva-gold-light",
        outline:
          "border border-riva-gold/50 bg-transparent text-riva-gold hover:bg-riva-gold/10",
        ghost: "text-riva-cream hover:bg-riva-card",
        link: "text-riva-gold underline-offset-4 hover:underline",
        destructive: "bg-riva-error text-white hover:opacity-90",
        "outline-light":
          "border border-riva-cream/30 bg-transparent text-riva-cream hover:border-riva-gold hover:text-riva-gold",
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
