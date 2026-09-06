import { describe, expect, it } from "vitest";

import { MENU_CATEGORIES } from "@/data/menu";
import {
  MENU_SECTION_SLUGS,
  RIVAS_MENY_COURSE_SLUGS,
  buildMenuNav,
  catalogHasMenuSections,
  isolateMenuHierarchy,
  topLevelCategories,
} from "@/lib/public-menu";

describe("isolateMenuHierarchy", () => {
  it("keeps flat course categories nested under RIVAS MENY", () => {
    const flat = [
      { name: "Förrätter", slug: "forratter", description: "", sortOrder: 0, parentSlug: null },
      { name: "Varmrätter", slug: "varmratter", description: "", sortOrder: 1, parentSlug: null },
      { name: "Sallader", slug: "sallader", description: "", sortOrder: 2, parentSlug: null },
      { name: "Pasta", slug: "pasta", description: "", sortOrder: 3, parentSlug: null },
      { name: "Barnmeny", slug: "barnmeny", description: "", sortOrder: 4, parentSlug: null },
      { name: "Desserter", slug: "desserter", description: "", sortOrder: 5, parentSlug: null },
    ];

    const isolated = isolateMenuHierarchy(flat);
    const tops = topLevelCategories(isolated).map((c) => c.slug);

    expect(tops).toEqual([...MENU_SECTION_SLUGS]);
    expect(tops).not.toContain("forratter");
    expect(catalogHasMenuSections(isolated)).toBe(true);

    for (const slug of RIVAS_MENY_COURSE_SLUGS) {
      const course = isolated.find((c) => c.slug === slug);
      expect(course?.parentSlug).toBe("rivas-meny");
    }
  });

  it("builds nav with RIVAS MENY children isolated from siblings", () => {
    const nav = buildMenuNav(isolateMenuHierarchy(MENU_CATEGORIES));
    expect(nav.map((n) => n.slug)).toEqual([...MENU_SECTION_SLUGS]);

    const rivas = nav.find((n) => n.slug === "rivas-meny");
    expect(rivas?.children?.map((c) => c.slug)).toEqual([...RIVAS_MENY_COURSE_SLUGS]);
    expect(nav.find((n) => n.slug === "take-away")?.children).toBeUndefined();
  });
});
