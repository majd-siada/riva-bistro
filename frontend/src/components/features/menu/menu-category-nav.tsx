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

/**
 * Horizontal category bar for /meny — sits above the active panel so guests
 * pick one section at a time instead of using a left sidebar.
 */
export function MenuCategoryNav({
  categories,
  activeSlug,
  onSelect,
  className,
}: MenuCategoryNavProps) {
  const activeSection =
    categories.find((c) => c.slug === activeSlug) ??
    categories.find((c) => c.children?.some((child) => child.slug === activeSlug));
  const showChildChips = Boolean(activeSection?.children?.length);

  return (
    <nav
      className={cn("space-y-4 border-b border-riva-gold/20 pb-5", className)}
      aria-label="Menykategorier"
    >
      <p className="riva-label">Kategorier</p>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
        {categories.map((cat) => {
          const childActive = cat.children?.some((c) => c.slug === activeSlug);
          const selected = activeSlug === cat.slug || Boolean(childActive);
          return (
            <NavChip
              key={cat.slug}
              slug={cat.slug}
              name={cat.name}
              active={selected}
              onSelect={onSelect}
            />
          );
        })}
      </div>

      {showChildChips && activeSection?.children?.length ? (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
          <NavChip
            slug={activeSection.slug}
            name="Alla"
            active={activeSlug === activeSection.slug}
            onSelect={onSelect}
            subtle
          />
          {activeSection.children.map((child) => (
            <NavChip
              key={child.slug}
              slug={child.slug}
              name={child.name}
              active={activeSlug === child.slug}
              onSelect={onSelect}
              subtle
            />
          ))}
        </div>
      ) : null}

      <AllergyNote />
    </nav>
  );
}

function NavChip({
  slug,
  name,
  active,
  onSelect,
  subtle,
}: {
  slug: string;
  name: string;
  active?: boolean;
  onSelect?: (slug: string) => void;
  subtle?: boolean;
}) {
  const className = cn(
    "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border px-4 transition-riva",
    subtle ? "min-h-10 py-2 text-xs" : "py-2.5 text-sm",
    active
      ? "border-riva-gold/50 bg-riva-gold/15 text-riva-gold"
      : "border-riva-gold/25 text-riva-muted hover:border-riva-gold/40 hover:text-riva-cream",
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

function AllergyNote() {
  return (
    <p className="flex items-start gap-2 text-xs leading-relaxed text-riva-muted">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-riva-gold" strokeWidth={1.25} />
      <span>
        <span className="font-semibold uppercase tracking-[0.14em] text-riva-gold">
          Allergier
        </span>
        {" — "}
        Berätta gärna om allergier eller intoleranser när du bokar eller beställer.
      </span>
    </p>
  );
}
