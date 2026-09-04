import { describe, expect, it } from "vitest";

import { MENU_CATEGORIES, MENU_ITEMS, getMenuByCategory } from "@/data/menu";

const FORRATTER_PRICES: Record<string, number> = {
  "toast-skagen-mediterranio": 95,
  "vitloksgratinerade-bla-musslor": 90,
  raraka: 105,
  "ost-chark-for-tva": 245,
  vitloksbrod: 49,
};

describe("fallback menu completeness", () => {
  it("lists Förrätter before Varmrätter and keeps the five existing categories", () => {
    const slugs = MENU_CATEGORIES.map((c) => c.slug);
    expect(slugs[0]).toBe("forratter");
    expect(slugs).toEqual([
      "forratter",
      "varmratter",
      "sallader",
      "pasta",
      "barnmeny",
      "desserter",
    ]);
  });

  it("includes all five Förrätter products with exact inc-VAT prices", () => {
    const forratter = MENU_ITEMS.filter((item) => item.categorySlug === "forratter");
    expect(forratter).toHaveLength(5);
    for (const [slug, price] of Object.entries(FORRATTER_PRICES)) {
      const item = forratter.find((entry) => entry.slug === slug);
      expect(item, slug).toBeDefined();
      expect(item!.priceIncVat).toBe(price);
    }
    expect(forratter.find((item) => item.slug === "vitloksbrod")!.description).toBe("");
  });

  it("groups Förrätter items under the Förrätter category", () => {
    const groups = getMenuByCategory();
    const starters = groups.find((group) => group.slug === "forratter");
    expect(starters?.name).toBe("Förrätter");
    expect(starters?.items.map((item) => item.slug)).toEqual(Object.keys(FORRATTER_PRICES));
  });
});
