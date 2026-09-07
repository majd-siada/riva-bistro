import type { ReactNode } from "react";

import { Section } from "@/components/layout/section";
import { PageBreadcrumbs } from "@/components/seo/page-breadcrumbs";

/**
 * Shared chrome for legal scaffolding pages.
 * Content is a technical template — not legal advice; owner/counsel must approve.
 */
export function LegalDocument({
  title,
  path,
  children,
}: {
  title: string;
  /** Canonical path for breadcrumb JSON-LD, e.g. `/integritetspolicy`. */
  path: string;
  children: ReactNode;
}) {
  return (
    <Section className="max-w-3xl">
      <PageBreadcrumbs
        items={[
          { name: "Hem", path: "/" },
          { name: title, path },
        ]}
      />
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
