import Link from "next/link";

import { BreadcrumbJsonLd, type BreadcrumbJsonLdItem } from "@/components/seo/json-ld";

type Crumb = BreadcrumbJsonLdItem;

/**
 * Visible breadcrumb trail + matching BreadcrumbList JSON-LD.
 * Keep labels claim-safe (page titles only — no invented marketing).
 */
export function PageBreadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length < 2) return null;

  return (
    <>
      <BreadcrumbJsonLd items={items} />
      <nav aria-label="Brödsmulor" className="mb-6 text-sm text-riva-muted">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, index) => {
            const last = index === items.length - 1;
            return (
              <li key={`${item.path}-${item.name}`} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {last ? (
                  <span aria-current="page" className="text-riva-cream">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.path} className="underline-offset-4 hover:text-riva-cream hover:underline">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
