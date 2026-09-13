import type { ReactNode } from "react";

import { Section } from "@/components/layout/section";
import { PageBreadcrumbs } from "@/components/seo/page-breadcrumbs";

/** Shared layout for public legal and policy pages. */
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
      <p className="riva-label">Information</p>
      <h1 className="mt-4 font-display text-4xl text-riva-cream md:text-5xl">{title}</h1>
      <div className="prose-riva mt-10 space-y-6 text-sm leading-relaxed text-riva-muted">
        {children}
      </div>
    </Section>
  );
}
