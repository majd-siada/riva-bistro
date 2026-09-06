"use client";

import { useEffect, useMemo, useState } from "react";

import { MenuCategoryNav } from "@/components/features/menu/menu-category-nav";
import {
  MENU_SECTION_REGISTRY,
  MenuSection,
} from "@/components/features/menu/sections";
import type { MenuNavEntry, MenuPanelData } from "@/lib/public-menu";

export type MenuPanel = MenuPanelData;

type MenuBrowserProps = {
  nav: MenuNavEntry[];
  panels: MenuPanelData[];
  defaultSlug: string;
};

function resolveInitialSlug(panels: MenuPanelData[], defaultSlug: string): string {
  if (typeof window === "undefined") return defaultSlug;
  const hash = window.location.hash.replace(/^#/, "");
  if (hash && panels.some((p) => p.slug === hash)) return hash;
  return defaultSlug;
}

/**
 * Top category bar + one active meny panel. No left sidebar; no long scroll
 * through every section.
 */
export function MenuBrowser({ nav, panels, defaultSlug }: MenuBrowserProps) {
  const panelBySlug = useMemo(
    () => new Map(panels.map((panel) => [panel.slug, panel])),
    [panels],
  );

  const [activeSlug, setActiveSlug] = useState(defaultSlug);

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

  return (
    <div className="space-y-10">
      <MenuCategoryNav
        categories={nav}
        activeSlug={activeSlug}
        onSelect={select}
      />

      <Resolved
        key={active.slug}
        category={active.category}
        items={active.items}
        subsections={active.subsections}
        isolated
      />
    </div>
  );
}
