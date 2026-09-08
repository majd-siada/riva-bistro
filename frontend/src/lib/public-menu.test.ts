import { describe, expect, it } from "vitest";

import { MENU_CATEGORIES, MENU_ITEMS } from "@/data/menu";
import {
  MENU_SECTION_SLUGS,
  RIVAS_MENY_COURSE_SLUGS,
  buildMenuNav,
  buildMenuPanels,
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

  it("nests children for any section that has categories in the catalog", () => {
    const withTakeawayKids = isolateMenuHierarchy([
      ...MENU_CATEGORIES,
      {
        name: "Burgare",
        slug: "takeaway-burgare",
        description: "",
        sortOrder: 1,
        parentSlug: "take-away",
      },
    ]);
    const nav = buildMenuNav(withTakeawayKids);
    expect(nav.find((n) => n.slug === "take-away")?.children?.map((c) => c.slug)).toEqual([
      "takeaway-burgare",
    ]);
  });

  it("preserves Django admin names and sort_order on existing sections", () => {
    const fromAdmin = [
      {
        name: "Lunch special",
        slug: "dagens-lunch",
        description: "From admin",
        sortOrder: 50,
        parentSlug: null,
      },
      {
        name: "RIVAS MENY",
        slug: "rivas-meny",
        description: "",
        sortOrder: 10,
        parentSlug: null,
      },
      {
        name: "TAKE AWAY",
        slug: "take-away",
        description: "",
        sortOrder: 20,
        parentSlug: null,
      },
      {
        name: "STORA SÄLLSKAPSMENY",
        slug: "stora-sallskapsmeny",
        description: "",
        sortOrder: 30,
        parentSlug: null,
      },
      {
        name: "SNACKS & DRINKAR",
        slug: "snacks-drinkar",
        description: "",
        sortOrder: 40,
        parentSlug: null,
      },
      {
        name: "DRYCK",
        slug: "dryck",
        description: "",
        sortOrder: 60,
        parentSlug: null,
      },
      {
        name: "Förrätter",
        slug: "forratter",
        description: "",
        sortOrder: 1,
        parentSlug: "rivas-meny",
      },
    ];

    const isolated = isolateMenuHierarchy(fromAdmin);
    const nav = buildMenuNav(isolated);

    expect(nav.map((n) => n.slug)).toEqual([
      "rivas-meny",
      "take-away",
      "stora-sallskapsmeny",
      "snacks-drinkar",
      "dagens-lunch",
      "dryck",
    ]);
    expect(nav.find((n) => n.slug === "dagens-lunch")?.name).toBe("Lunch special");
    expect(isolated.find((c) => c.slug === "dagens-lunch")?.description).toBe("From admin");
  });
});

describe("buildMenuPanels", () => {
  it("creates one panel per top-level section plus one per RIVAS course", () => {
    const categories = isolateMenuHierarchy(MENU_CATEGORIES);
    const panels = buildMenuPanels(categories, MENU_ITEMS);
    const slugs = panels.map((p) => p.slug);

    expect(slugs).toEqual([
      ...MENU_SECTION_SLUGS.slice(0, 2),
      ...RIVAS_MENY_COURSE_SLUGS,
      ...MENU_SECTION_SLUGS.slice(2),
    ]);

    const lunch = panels.find((p) => p.slug === "dagens-lunch");
    const rivas = panels.find((p) => p.slug === "rivas-meny");
    const starters = panels.find((p) => p.slug === "forratter");

    expect(lunch?.subsections).toBeUndefined();
    expect(rivas?.subsections?.map((s) => s.category.slug)).toEqual([
      ...RIVAS_MENY_COURSE_SLUGS,
    ]);
    expect(starters?.items.length).toBeGreaterThan(0);
    expect(starters?.subsections).toBeUndefined();
  });

  it("builds subsections for non-RIVAS sections that have child categories", () => {
    const categories = isolateMenuHierarchy([
      ...MENU_CATEGORIES,
      {
        name: "Burgare",
        slug: "takeaway-burgare",
        description: "",
        sortOrder: 1,
        parentSlug: "take-away",
      },
    ]);
    const items = [
      ...MENU_ITEMS,
      {
        categorySlug: "takeaway-burgare",
        name: "Classic",
        slug: "classic-ta",
        description: "",
        priceIncVat: 129,
      },
    ];
    const panels = buildMenuPanels(categories, items);
    const takeaway = panels.find((p) => p.slug === "take-away");
    expect(takeaway?.subsections?.map((s) => s.category.slug)).toEqual([
      "takeaway-burgare",
    ]);
    expect(takeaway?.subsections?.[0]?.items.map((i) => i.slug)).toEqual(["classic-ta"]);
    expect(panels.find((p) => p.slug === "takeaway-burgare")?.items).toHaveLength(1);
  });
});
