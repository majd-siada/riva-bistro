"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Section } from "@/components/layout/section";
import { StateMessage } from "@/components/ui/state-message";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section className="pt-24">
      <StateMessage
        variant="error"
        title="Något gick fel"
        description="Ett oväntat fel uppstod. Försök igen om en stund."
        action={<Button onClick={reset}>Försök igen</Button>}
      />
    </Section>
  );
}
