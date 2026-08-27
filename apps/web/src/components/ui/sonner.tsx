"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group border border-riva-ink/10 bg-riva-ivory text-riva-ink shadow-elevated",
          description: "text-riva-taupe",
          actionButton: "bg-riva-teal text-on-dark",
          cancelButton: "bg-riva-ink/10 text-riva-ink-soft",
          success: "border-riva-success/30",
          error: "border-riva-error/30",
        },
      }}
    />
  );
}
