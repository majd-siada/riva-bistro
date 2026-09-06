"use client";

import { useEffect, useMemo, useState } from "react";

import { MenuCategoryNav } from "@/components/features/menu/menu-category-nav";
import {
  MENU_SECTION_REGISTRY,
  MenuSection,
} from "@/components/features/menu/sections";
import {
  RIVAS_MENY_COURSE_SLUGS,
  type MenuNavEntry,
  type MenuPanelData,
} from "@/lib/public-menu";

export type MenuPanel = MenuPanelData;

type MenuBrowserProps = {
  nav: MenuNavEntry[];
  panels: MenuPanelData[];
  defaultSlug: string;
};

const COURSE_SET = new Set<string>(RIVAS_MENY_COURSE_SLUGS);

function resolveInitialSlug(panels: MenuPanelData[], defaultSlug: string): string {
  if (typeof window === "undefined") return defaultSlug;
  const hash = window.location.hash.replace(/^#/, "");
  if (hash && panels.some((p) => p.slug === hash)) return hash;
  return defaultSlug;
}

/**
 * Shows exactly one meny panel at a time. Category clicks switch the panel
 * instead of scrolling through every section on one long page.
 */
export function MenuBrowser({ nav, panels, defaultSlug }: MenuBrowserProps) {
  const panelBySlug = useMemo(
    () => new Map(panels.map((panel) => [panel.slug, panel])),
    [panels],
  );

  const [activeSlug, setActiveSlug] = useState(defaultSlug);
  const rivasChildren = nav.find((c) => c.slug === "rivas-meny")?.children ?? [];

  useEffect(() => {
    setActiveSlug(resolveInitialSlug(panels, defaultSlug));
  }, [panels, defaultSlug]);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash && panelBySlug.has(hash)) setActiveSlug(hash);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [panelBySlug]);

  function select(slug: string) {
    setActiveSlug(slug);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${slug}`);
    }
  }

  const active = panelBySlug.get(activeSlug) ?? panels[0];
  if (!active) return null;

  const Resolved =
    active.category.slug === "rivas-meny"
      ? MENU_SECTION_REGISTRY["rivas-meny"]!
      : (MENU_SECTION_REGISTRY[active.category.slug] ?? MenuSection);

  const rivasContextActive =
    activeSlug === "rivas-meny" || COURSE_SET.has(activeSlug);

  return (
    <div className="grid gap-12 lg:grid-cols-[220px_1fr] xl:grid-cols-[260px_1fr]">
      <div className="hidden lg:block">
        <div className="sticky top-28">
          <MenuCategoryNav
            categories={nav}
            activeSlug={activeSlug}
            onSelect={select}
          />
        </div>
      </div>

      <div className="min-w-0">
        <div className="-mx-6 mb-6 flex gap-3 overflow-x-auto px-6 pb-2 lg:hidden">
          {nav.map((cat) => {
            const selected =
              activeSlug === cat.slug ||
              Boolean(cat.children?.some((c) => c.slug === activeSlug));
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => select(cat.slug)}
                className={
                  selected
                    ? "shrink-0 rounded-full border border-riva-gold/50 bg-riva-gold/15 px-4 py-2 text-sm text-riva-gold"
                    : "shrink-0 rounded-full border border-riva-gold/30 px-4 py-2 text-sm text-riva-cream"
                }
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {rivasContextActive && rivasChildren.length > 0 ? (
          <div className="-mx-6 mb-6 flex gap-2 overflow-x-auto px-6 pb-1 lg:hidden">
            <button
              type="button"
              onClick={() => select("rivas-meny")}
              className={
                activeSlug === "rivas-meny"
                  ? "shrink-0 rounded-full bg-riva-gold/20 px-3 py-1.5 text-xs text-riva-gold"
                  : "shrink-0 rounded-full px-3 py-1.5 text-xs text-riva-muted"
              }
            >
              Alla
            </button>
            {rivasChildren.map((child) => (
              <button
                key={child.slug}
                type="button"
                onClick={() => select(child.slug)}
                className={
                  activeSlug === child.slug
                    ? "shrink-0 rounded-full bg-riva-gold/20 px-3 py-1.5 text-xs text-riva-gold"
                    : "shrink-0 rounded-full px-3 py-1.5 text-xs text-riva-muted"
                }
              >
                {child.name}
              </button>
            ))}
          </div>
        ) : null}

        <Resolved
          key={active.slug}
          category={active.category}
          items={active.items}
          subsections={active.subsections}
          isolated
        />
      </div>
    </div>
  );
}
