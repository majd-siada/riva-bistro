"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "group border border-riva-cream/10 bg-riva-card text-riva-cream shadow-elevated",
          description: "text-riva-muted",
          actionButton: "bg-riva-gold text-riva-black",
          cancelButton: "bg-riva-surface text-riva-muted",
          success: "border-riva-success/30",
          error: "border-riva-error/30",
        },
      }}
    />
  );
}
