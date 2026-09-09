import { describe, expect, it, vi } from "vitest";

import { MENU_CATEGORIES, MENU_ITEMS } from "@/data/menu";
import {
  MENU_SECTION_SLUGS,
  RIVAS_MENY_COURSE_SLUGS,
  buildMenuNav,
  buildMenuPanels,
  catalogHasAnyMenuSection,
  catalogHasMenuSections,
  isolateMenuHierarchy,
  loadFeaturedItems,
  loadPublicMenu,
  topLevelCategories,
} from "@/lib/public-menu";

vi.mock("@/lib/api", () => ({
  fetchCategories: vi.fn(),
  fetchProducts: vi.fn(),
  fetchFeatured: vi.fn(),
  resolveImageUrl: (url: string) => url,
}));

import { fetchCategories, fetchFeatured, fetchProducts } from "@/lib/api";

const modernSections = [
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
    const isolated = isolateMenuHierarchy(modernSections);
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

  it("does not reinject inactive top-level sections omitted from the API", () => {
    const withoutTakeAway = modernSections.filter((c) => c.slug !== "take-away");
    expect(catalogHasAnyMenuSection(withoutTakeAway)).toBe(true);

    const isolated = isolateMenuHierarchy(withoutTakeAway);
    const nav = buildMenuNav(isolated);

    expect(nav.map((n) => n.slug)).not.toContain("take-away");
    expect(nav.map((n) => n.slug)).toContain("rivas-meny");
    expect(nav.map((n) => n.slug)).toContain("dryck");
  });

  it("does not reinject inactive RIVAS course categories omitted from the API", () => {
    const withoutForratter = modernSections.filter((c) => c.slug !== "forratter");
    const withVarmratter = [
      ...withoutForratter,
      {
        name: "Varmrätter",
        slug: "varmratter",
        description: "",
        sortOrder: 2,
        parentSlug: "rivas-meny" as string | null,
      },
    ];

    const isolated = isolateMenuHierarchy(withVarmratter);
    const rivas = buildMenuNav(isolated).find((n) => n.slug === "rivas-meny");

    expect(rivas?.children?.map((c) => c.slug)).toEqual(["varmratter"]);
    expect(isolated.find((c) => c.slug === "forratter")).toBeUndefined();
  });
});

function apiCategory(
  c: (typeof modernSections)[number],
  overrides: Partial<{
    id: number;
    name: string;
    description: string;
    sort_order: number;
    product_count: number;
  }> = {},
) {
  return {
    id: overrides.id ?? 1,
    name: overrides.name ?? c.name,
    slug: c.slug,
    description: overrides.description ?? c.description,
    parent: null,
    parent_slug: c.parentSlug,
    sort_order: overrides.sort_order ?? c.sortOrder,
    product_count: overrides.product_count ?? 0,
  };
}

function apiProduct(overrides: {
  id?: number;
  name: string;
  slug: string;
  category_slug: string;
  price_inc_vat: number;
  description?: string;
  is_featured?: boolean;
}) {
  return {
    id: overrides.id ?? 1,
    name: overrides.name,
    slug: overrides.slug,
    description: overrides.description ?? "",
    image_url: "",
    is_available: true,
    is_featured: overrides.is_featured ?? false,
    category_name: overrides.category_slug,
    category_slug: overrides.category_slug,
    pricing: {
      price_ex_vat: String(overrides.price_inc_vat),
      vat_amount: "0",
      vat_rate: "0.12",
      price_inc_vat: String(overrides.price_inc_vat),
    },
  };
}

describe("loadPublicMenu", () => {
  it("uses the populated API catalog as the dish source of truth", async () => {
    vi.mocked(fetchCategories).mockResolvedValue(modernSections.map((c) => apiCategory(c)));
    vi.mocked(fetchProducts).mockResolvedValue([
      apiProduct({
        name: "Toast Skagen",
        slug: "toast-skagen",
        category_slug: "forratter",
        price_inc_vat: 145,
        description: "From CMS",
      }),
    ]);

    const menu = await loadPublicMenu();
    expect(menu.items).toHaveLength(1);
    expect(menu.items[0]).toMatchObject({
      name: "Toast Skagen",
      slug: "toast-skagen",
      categorySlug: "forratter",
      priceIncVat: "145",
      description: "From CMS",
    });
    expect(menu.items.map((i) => i.slug)).not.toContain(MENU_ITEMS[0]?.slug);
  });

  it("reflects product price updates from the API", async () => {
    vi.mocked(fetchCategories).mockResolvedValue(modernSections.map((c) => apiCategory(c)));
    vi.mocked(fetchProducts).mockResolvedValue([
      apiProduct({
        name: "Pasta",
        slug: "pasta-riva",
        category_slug: "pasta",
        price_inc_vat: 199,
      }),
    ]);

    const first = await loadPublicMenu();
    expect(first.items[0]?.priceIncVat).toBe("199");

    vi.mocked(fetchProducts).mockResolvedValue([
      apiProduct({
        name: "Pasta",
        slug: "pasta-riva",
        category_slug: "pasta",
        price_inc_vat: 219,
      }),
    ]);
    const second = await loadPublicMenu();
    expect(second.items[0]?.priceIncVat).toBe("219");
  });

  it("reflects category name and sort changes from the API", async () => {
    vi.mocked(fetchCategories).mockResolvedValue(
      modernSections.map((c) =>
        c.slug === "dagens-lunch"
          ? apiCategory(c, { name: "Lunch idag", sort_order: 1 })
          : apiCategory(c),
      ),
    );
    vi.mocked(fetchProducts).mockResolvedValue([]);

    const menu = await loadPublicMenu();
    const lunch = menu.categories.find((c) => c.slug === "dagens-lunch");
    expect(lunch?.name).toBe("Lunch idag");
    expect(lunch?.sortOrder).toBe(1);
    expect(buildMenuNav(menu.categories)[0]?.slug).toBe("dagens-lunch");
  });

  it("keeps live categories when the product list is empty", async () => {
    vi.mocked(fetchCategories).mockResolvedValue(modernSections.map((c) => apiCategory(c)));
    vi.mocked(fetchProducts).mockResolvedValue([]);

    const menu = await loadPublicMenu();
    expect(menu.items).toEqual([]);
    expect(buildMenuNav(menu.categories).map((n) => n.slug)).toContain("rivas-meny");
    expect(buildMenuNav(menu.categories).map((n) => n.slug)).not.toContain("missing");
  });

  it("does not invent dishes when the catalog has no categories", async () => {
    vi.mocked(fetchCategories).mockResolvedValue([]);
    vi.mocked(fetchProducts).mockResolvedValue([]);

    const menu = await loadPublicMenu();
    expect(menu.items).toEqual([]);
    expect(buildMenuNav(menu.categories).map((n) => n.slug)).toEqual([
      ...MENU_SECTION_SLUGS,
    ]);
  });

  it("does not invent dishes when the catalog API throws", async () => {
    vi.mocked(fetchCategories).mockRejectedValue(new Error("network"));
    vi.mocked(fetchProducts).mockRejectedValue(new Error("network"));

    const menu = await loadPublicMenu();
    expect(menu.items).toEqual([]);
  });
});

describe("loadFeaturedItems", () => {
  it("returns featured products from the API", async () => {
    vi.mocked(fetchFeatured).mockResolvedValue([
      apiProduct({
        name: "Featured dish",
        slug: "featured-dish",
        category_slug: "varmratter",
        price_inc_vat: 255,
        is_featured: true,
      }),
    ]);
    const featured = await loadFeaturedItems();
    expect(featured).toHaveLength(1);
    expect(featured[0]).toMatchObject({
      name: "Featured dish",
      slug: "featured-dish",
      priceIncVat: "255",
    });
  });

  it("returns empty when featured API fails", async () => {
    vi.mocked(fetchFeatured).mockRejectedValue(new Error("network"));
    expect(await loadFeaturedItems()).toEqual([]);
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
