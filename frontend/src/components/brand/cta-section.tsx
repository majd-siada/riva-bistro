import Link from "next/link";

import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";

export function CTASection({
  title = "Boka ett bord",
  description = "Vi dukar för långa middagar och minnesvärda kvällar.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Section className="bg-riva-surface/50">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl text-riva-cream md:text-4xl">{title}</h2>
        <p className="mt-4 text-riva-muted">{description}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="gold">
            <Link href="/boka">Boka bord</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/meny">Se menyn</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
