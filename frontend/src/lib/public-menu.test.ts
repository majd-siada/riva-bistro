import { describe, expect, it } from "vitest";

import { MENU_CATEGORIES, MENU_ITEMS } from "@/data/menu";
import {
  sectionHasContent,
  visibleTopLevelSections,
  type PublicCategory,
  type PublicItem,
} from "@/lib/public-menu";

const categories: PublicCategory[] = MENU_CATEGORIES.map((c) => ({
  name: c.name,
  slug: c.slug,
  description: c.description,
  sortOrder: c.sortOrder,
  parentSlug: c.parentSlug,
}));

const items: PublicItem[] = MENU_ITEMS.map((item) => ({
  categorySlug: item.categorySlug,
  name: item.name,
  slug: item.slug,
  description: item.description,
  priceIncVat: item.priceIncVat,
}));

describe("visibleTopLevelSections", () => {
  it("hides empty top-level shells and keeps RIVAS MENY when courses have dishes", () => {
    const visible = visibleTopLevelSections(categories, items);
    expect(visible.map((s) => s.slug)).toEqual(["rivas-meny"]);
    expect(visible[0].name).toBe("RIVAS MENY");
  });

  it("shows dagens-lunch once it has direct items", () => {
    const withLunch = [
      ...items,
      {
        categorySlug: "dagens-lunch",
        name: "Dagens pasta",
        slug: "dagens-pasta",
        description: "",
        priceIncVat: 129,
      },
    ];
    expect(visibleTopLevelSections(categories, withLunch).map((s) => s.slug)).toEqual([
      "dagens-lunch",
      "rivas-meny",
    ]);
  });

  it("sectionHasContent is false for empty take-away", () => {
    const takeAway = categories.find((c) => c.slug === "take-away")!;
    expect(sectionHasContent(takeAway, categories, items)).toBe(false);
  });
});
