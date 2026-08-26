import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-sm border bg-riva-charcoal px-4 py-2 text-sm text-riva-ivory transition-riva placeholder:text-riva-mist/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riva-gold focus-visible:ring-offset-2 focus-visible:ring-offset-riva-black disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-riva-error" : "border-riva-ivory/20",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
