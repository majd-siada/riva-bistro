"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const KEY = "riva-cookie-consent";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(!window.localStorage.getItem(KEY));
    } catch {
      setVisible(false);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-lg border border-riva-cream/15 bg-riva-surface p-4 shadow-elevated md:left-auto">
      <p className="text-sm text-riva-cream">Vi värdesätter din integritet</p>
      <p className="mt-2 text-xs leading-relaxed text-riva-muted">
        Vi använder endast nödvändiga kakor för att webbplatsen ska fungera, bland annat
        för inloggning i administrationen. Ingen reklamspårning.
      </p>
      <div className="mt-3 flex justify-end">
        <Button
          size="sm"
          variant="gold"
          onClick={() => {
            try {
              window.localStorage.setItem(KEY, "necessary");
            } catch {
              /* ignore */
            }
            setVisible(false);
          }}
        >
          Förstår
        </Button>
      </div>
    </div>
  );
}
