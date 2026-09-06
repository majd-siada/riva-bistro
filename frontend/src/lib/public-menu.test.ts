import { describe, expect, it } from "vitest";

import { MENU_CATEGORIES } from "@/data/menu";
import {
  MENU_SECTION_SLUGS,
  catalogHasMenuSections,
  topLevelCategories,
} from "@/lib/public-menu";

describe("catalogHasMenuSections", () => {
  it("is false for the flat production course list", () => {
    const flat = [
      { slug: "forratter", parentSlug: null },
      { slug: "varmratter", parentSlug: null },
      { slug: "sallader", parentSlug: null },
      { slug: "pasta", parentSlug: null },
      { slug: "barnmeny", parentSlug: null },
      { slug: "desserter", parentSlug: null },
    ];
    expect(catalogHasMenuSections(flat)).toBe(false);
  });

  it("is true for the seeded six-section hierarchy", () => {
    const seeded = MENU_CATEGORIES.map((c) => ({
      slug: c.slug,
      parentSlug: c.parentSlug,
    }));
    expect(catalogHasMenuSections(seeded)).toBe(true);
    expect(topLevelCategories(MENU_CATEGORIES).map((c) => c.slug)).toEqual([
      ...MENU_SECTION_SLUGS,
    ]);
  });
});
