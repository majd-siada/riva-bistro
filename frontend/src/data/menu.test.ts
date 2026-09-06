import { describe, expect, it } from "vitest";

import {
  MENU_CATEGORIES,
  MENU_ITEMS,
  getMenuByCategory,
} from "@/data/menu";

const FORRATTER_PRICES: Record<string, number> = {
  "toast-skagen-mediterranio": 95,
  "vitloksgratinerade-bla-musslor": 90,
  raraka: 105,
  "ost-chark-for-tva": 245,
  vitloksbrod: 49,
};

describe("fallback menu hierarchy", () => {
  it("exposes six top-level sections in display order", () => {
    const tops = MENU_CATEGORIES.filter((c) => c.parentSlug == null);
    expect(tops.map((c) => c.slug)).toEqual([
      "dagens-lunch",
      "rivas-meny",
      "take-away",
      "stora-sallskapsmeny",
      "snacks-drinkar",
      "dryck",
    ]);
    expect(tops.map((c) => c.sortOrder)).toEqual([10, 20, 30, 40, 50, 60]);
    expect(tops[0].name).toBe("Dagens lunch");
    expect(tops[0].name).not.toContain("?");
  });

  it("nests course categories under rivas-meny", () => {
    const courses = MENU_CATEGORIES.filter((c) => c.parentSlug === "rivas-meny");
    expect(courses.map((c) => c.slug)).toEqual([
      "forratter",
      "varmratter",
      "sallader",
      "pasta",
      "barnmeny",
      "desserter",
    ]);
  });

  it("keeps Förrätter products with exact inc-VAT prices", () => {
    const forratter = MENU_ITEMS.filter((item) => item.categorySlug === "forratter");
    expect(forratter).toHaveLength(5);
    for (const [slug, price] of Object.entries(FORRATTER_PRICES)) {
      const item = forratter.find((entry) => entry.slug === slug);
      expect(item, slug).toBeDefined();
      expect(item!.priceIncVat).toBe(price);
    }
  });

  it("groups Förrätter items under the Förrätter course category", () => {
    const groups = getMenuByCategory();
    const starters = groups.find((group) => group.slug === "forratter");
    expect(starters?.name).toBe("Förrätter");
    expect(starters?.items.map((item) => item.slug)).toEqual(Object.keys(FORRATTER_PRICES));
  });

  it("does not attach course items to unrelated top-level sections", () => {
    expect(MENU_ITEMS.filter((item) => item.categorySlug === "dryck")).toHaveLength(0);
    expect(MENU_ITEMS.filter((item) => item.categorySlug === "take-away")).toHaveLength(0);
    expect(MENU_ITEMS.every((item) => item.categorySlug !== "rivas-meny")).toBe(true);
  });
});
