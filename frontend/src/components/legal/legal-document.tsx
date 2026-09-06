import type { ReactNode } from "react";

import { Section } from "@/components/layout/section";

/**
 * Shared chrome for legal scaffolding pages.
 * Content is a technical template — not legal advice; owner/counsel must approve.
 */
export function LegalDocument({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Section className="max-w-3xl">
      <p className="riva-label">Juridisk information</p>
      <h1 className="mt-4 font-display text-4xl text-riva-cream md:text-5xl">{title}</h1>
      <p className="mt-4 rounded-md border border-riva-gold/30 bg-riva-surface/60 px-4 py-3 text-sm text-riva-muted">
        Detta är en teknisk malltext. Den är inte juridisk rådgivning och måste granskas
        och godkännas av Riva Bistros ägare och/eller jurist innan den behandlas som
        slutgiltig policy.
      </p>
      <div className="prose-riva mt-10 space-y-6 text-sm leading-relaxed text-riva-muted">
        {children}
      </div>
    </Section>
  );
}
