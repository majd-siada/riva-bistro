import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[112px] w-full rounded-md border bg-riva-surface px-4 py-3 text-sm text-riva-cream transition-riva placeholder:text-riva-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-riva-gold focus-visible:ring-offset-2 focus-visible:ring-offset-riva-black disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-riva-error" : "border-riva-cream/15",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
