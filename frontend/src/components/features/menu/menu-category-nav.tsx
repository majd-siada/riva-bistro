"use client";

import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MenuNavEntry } from "@/lib/public-menu";

interface MenuCategoryNavProps {
  categories: MenuNavEntry[];
  activeSlug?: string;
  className?: string;
}

export function MenuCategoryNav({ categories, activeSlug, className }: MenuCategoryNavProps) {
  return (
    <nav className={cn("space-y-6", className)} aria-label="Menykategorier">
      <div>
        <p className="riva-label mb-4">Kategorier</p>
        <ul className="space-y-1">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <a
                href={`#${cat.slug}`}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm transition-riva",
                  activeSlug === cat.slug
                    ? "bg-riva-gold/15 text-riva-gold"
                    : "text-riva-muted hover:bg-riva-card hover:text-riva-cream",
                )}
              >
                {cat.name}
              </a>
              {cat.children?.length ? (
                <ul className="mt-1 space-y-0.5 border-l border-riva-gold/20 py-1 pl-3">
                  {cat.children.map((child) => (
                    <li key={child.slug}>
                      <a
                        href={`#${child.slug}`}
                        className={cn(
                          "block rounded-md px-3 py-1.5 text-sm transition-riva",
                          activeSlug === child.slug
                            ? "bg-riva-gold/10 text-riva-gold"
                            : "text-riva-muted/90 hover:bg-riva-card hover:text-riva-cream",
                        )}
                      >
                        {child.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      <AllergyBox />
    </nav>
  );
}

function AllergyBox() {
  return (
    <div className="rounded-lg border border-riva-gold/25 bg-riva-card/80 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-riva-gold" strokeWidth={1.25} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-riva-gold">
            Allergier
          </p>
          <p className="mt-2 text-xs leading-relaxed text-riva-muted">
            Berätta gärna om allergier eller intoleranser när du bokar bord eller beställer.
            Vi anpassar måltiden efter dina behov.
          </p>
        </div>
      </div>
    </div>
  );
}
