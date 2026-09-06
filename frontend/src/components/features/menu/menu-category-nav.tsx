"use client";

import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MenuNavEntry } from "@/lib/public-menu";

interface MenuCategoryNavProps {
  categories: MenuNavEntry[];
  activeSlug?: string;
  onSelect?: (slug: string) => void;
  className?: string;
}

export function MenuCategoryNav({
  categories,
  activeSlug,
  onSelect,
  className,
}: MenuCategoryNavProps) {
  return (
    <nav className={cn("space-y-6", className)} aria-label="Menykategorier">
      <div>
        <p className="riva-label mb-4">Kategorier</p>
        <ul className="space-y-1">
          {categories.map((cat) => {
            const childActive = cat.children?.some((c) => c.slug === activeSlug);
            const parentActive = activeSlug === cat.slug || Boolean(childActive);

            return (
              <li key={cat.slug}>
                <NavButton
                  slug={cat.slug}
                  name={cat.name}
                  active={activeSlug === cat.slug}
                  emphasized={parentActive}
                  onSelect={onSelect}
                />
                {cat.children?.length ? (
                  <ul className="mt-1 space-y-0.5 border-l border-riva-gold/20 py-1 pl-3">
                    {cat.children.map((child) => (
                      <li key={child.slug}>
                        <NavButton
                          slug={child.slug}
                          name={child.name}
                          active={activeSlug === child.slug}
                          onSelect={onSelect}
                          compact
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
      <AllergyBox />
    </nav>
  );
}

function NavButton({
  slug,
  name,
  active,
  emphasized,
  compact,
  onSelect,
}: {
  slug: string;
  name: string;
  active?: boolean;
  emphasized?: boolean;
  compact?: boolean;
  onSelect?: (slug: string) => void;
}) {
  const className = cn(
    "block w-full rounded-md text-left transition-riva",
    compact ? "px-3 py-1.5 text-sm" : "px-3 py-2 text-sm",
    active
      ? "bg-riva-gold/15 text-riva-gold"
      : emphasized
        ? "text-riva-cream"
        : "text-riva-muted hover:bg-riva-card hover:text-riva-cream",
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(slug)}
        className={className}
        aria-current={active ? "true" : undefined}
      >
        {name}
      </button>
    );
  }

  return (
    <a href={`#${slug}`} className={className} aria-current={active ? "true" : undefined}>
      {name}
    </a>
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
