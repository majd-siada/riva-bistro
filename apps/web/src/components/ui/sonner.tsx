"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group border border-riva-ivory/10 bg-riva-charcoal text-riva-ivory shadow-elevated",
          description: "text-riva-mist",
          actionButton: "bg-riva-teal text-riva-ivory",
          cancelButton: "bg-riva-ivory/10 text-riva-mist",
          success: "border-riva-success/30",
          error: "border-riva-error/30",
        },
      }}
    />
  );
}
