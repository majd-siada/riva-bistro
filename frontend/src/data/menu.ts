/**
 * Fallback public menu if the catalog API is unreachable or empty.
 *
 * Kept intentionally for resilience: production prefers Django catalog
 * (admin CMS → GET /api/v1/menu/). This static copy is only used when the
 * API fails so the site still shows dishes instead of an empty menu.
 * Prices inkl. moms (12 %). Do not treat this as the source of truth once
 * the catalog is seeded in production.
 *
 * Hierarchy mirrors production: six top-level sections; course-type
 * categories are children of rivas-meny. Items stay on course slugs.
 */

export interface MenuCategory {
  name: string;
  slug: string;
  description: string;
  /** Canonical display order from the API/seed (not alphabetical). */
  sortOrder: number;
  /** null = top-level menu section */
  parentSlug: string | null;
}

export interface MenuItem {
  categorySlug: string;
  name: string;
  slug: string;
  description: string;
  priceIncVat: number;
}

export const MENU_CATEGORIES: MenuCategory[] = [
  // Top-level sections (sort_order gaps match backend seed)
  {
    name: "Dagens lunch",
    slug: "dagens-lunch",
    description: "",
    sortOrder: 10,
    parentSlug: null,
  },
  {
    name: "RIVAS MENY",
    slug: "rivas-meny",
    description: "",
    sortOrder: 20,
    parentSlug: null,
  },
  {
    name: "TAKE AWAY",
    slug: "take-away",
    description: "",
    sortOrder: 30,
    parentSlug: null,
  },
  {
    name: "STORA SÄLLSKAPSMENY",
    slug: "stora-sallskapsmeny",
    description: "",
    sortOrder: 40,
    parentSlug: null,
  },
  {
    name: "SNACKS & DRINKAR",
    slug: "snacks-drinkar",
    description: "",
    sortOrder: 50,
    parentSlug: null,
  },
  {
    name: "DRYCK",
    slug: "dryck",
    description: "",
    sortOrder: 60,
    parentSlug: null,
  },
  // Course-type subsections under RIVAS MENY
  {
    name: "Förrätter",
    slug: "forratter",
    description: "Små rätter som väcker aptiten.",
    sortOrder: 0,
    parentSlug: "rivas-meny",
  },
  {
    name: "Varmrätter",
    slug: "varmratter",
    description: "Husets varma rätter, tillagade med omsorg.",
    sortOrder: 1,
    parentSlug: "rivas-meny",
  },
  {
    name: "Sallader",
    slug: "sallader",
    description: "Fräscha sallader med säsongens råvaror.",
    sortOrder: 2,
    parentSlug: "rivas-meny",
  },
  {
    name: "Pasta",
    slug: "pasta",
    description: "Italienskt hantverk, à la Riva.",
    sortOrder: 3,
    parentSlug: "rivas-meny",
  },
  {
    name: "Barnmeny",
    slug: "barnmeny",
    description: "För våra minsta gäster.",
    sortOrder: 4,
    parentSlug: "rivas-meny",
  },
  {
    name: "Desserter",
    slug: "desserter",
    description: "Söta avslut på måltiden.",
    sortOrder: 5,
    parentSlug: "rivas-meny",
  },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    categorySlug: "forratter",
    name: "Toast skagen Mediterranio",
    slug: "toast-skagen-mediterranio",
    description:
      "Handskalade räkor, örtmajonnäs, löjrom och rostat bröd, Kökets rekommendation",
    priceIncVat: 95,
  },
  {
    categorySlug: "forratter",
    name: "Vitlöksgratinerade blå musslor",
    slug: "vitloksgratinerade-bla-musslor",
    description: "Blåmusslor, vitlökssmör, örter och bröd",
    priceIncVat: 90,
  },
  { categorySlug: "forratter", name: "Råraka", slug: "raraka", description: "Klassisk tillbehör", priceIncVat: 105 },
  {
    categorySlug: "forratter",
    name: "Ost & Chark för två",
    slug: "ost-chark-for-tva",
    description: "Urval av lagrade ostar och charkuterier, tillbehör",
    priceIncVat: 245,
  },
  { categorySlug: "forratter", name: "Vitlöksbröd", slug: "vitloksbrod", description: "", priceIncVat: 49 },
  { categorySlug: "varmratter", name: "Entrecôte", slug: "entrecote", description: "Grillad entrecôte med tillbehör.", priceIncVat: 305 },
  { categorySlug: "varmratter", name: "Grillad lammracks", slug: "grillad-lammracks", description: "Grillad lammracks, säsongens tillbehör.", priceIncVat: 315 },
  { categorySlug: "varmratter", name: "Rivas köttbullar", slug: "rivas-kottbullar", description: "Husets köttbullar med gräddsås och lingon.", priceIncVat: 185 },
  { categorySlug: "varmratter", name: "Halstrad röding", slug: "halstrad-roding", description: "Halstrad röding med brynt smör.", priceIncVat: 265 },
  { categorySlug: "varmratter", name: "Havets delikatesser", slug: "havets-delikatesser", description: "Utvalda delikatesser från havet.", priceIncVat: 299 },
  { categorySlug: "varmratter", name: "Hängmörad ryggbiff", slug: "hangmorad-ryggbiff", description: "Hängmörad ryggbiff, grillad till perfektion.", priceIncVat: 299 },
  { categorySlug: "varmratter", name: "Rivas Fisk & Skaldjurssoppa", slug: "fisk-skaldjurssoppa", description: "Rustik soppa på fisk och skaldjur.", priceIncVat: 199 },
  { categorySlug: "varmratter", name: "Rivas burgare / halloumi", slug: "rivas-burgare", description: "Rivas burgare — välj nötfärs eller halloumi.", priceIncVat: 175 },
  { categorySlug: "sallader", name: "Caesarsallad", slug: "caesarsallad", description: "Klassisk caesarsallad.", priceIncVat: 175 },
  { categorySlug: "sallader", name: "Räksallad deluxe", slug: "raksallad-deluxe", description: "Generös räksallad med handskalade räkor.", priceIncVat: 185 },
  { categorySlug: "sallader", name: "Grekisk sallad", slug: "grekisk-sallad", description: "Fetaost, oliver, tomat och gurka.", priceIncVat: 165 },
  { categorySlug: "pasta", name: "Pasta Filetto di manzo premium", slug: "filetto-di-manzo", description: "Premiumpasta med oxfilé.", priceIncVat: 245 },
  { categorySlug: "pasta", name: "Pesto Pollo", slug: "pesto-pollo", description: "Pasta med kyckling och pesto.", priceIncVat: 169 },
  { categorySlug: "pasta", name: "Vegetariano", slug: "vegetariano", description: "Vegetarisk pasta med säsongens grönsaker.", priceIncVat: 169 },
  { categorySlug: "barnmeny", name: "Rivas Köttbullar", slug: "barn-kottbullar", description: "Köttbullar med potatismos.", priceIncVat: 80 },
  { categorySlug: "barnmeny", name: "Pannkakor", slug: "barn-pannkakor", description: "Pannkakor med sylt och grädde.", priceIncVat: 75 },
  { categorySlug: "barnmeny", name: "Hamburgare", slug: "barn-hamburgare", description: "Liten hamburgare med pommes.", priceIncVat: 105 },
  { categorySlug: "barnmeny", name: "Rivas köttbullar med pasta", slug: "barn-kottbullar-pasta", description: "Köttbullar med pasta.", priceIncVat: 75 },
  { categorySlug: "barnmeny", name: "Barnglass", slug: "barn-glass", description: "En kula glass.", priceIncVat: 30 },
  { categorySlug: "barnmeny", name: "Barndricka", slug: "barn-dricka", description: "Läsk eller saft.", priceIncVat: 25 },
  { categorySlug: "desserter", name: "Varm Chokladfondant", slug: "varm-chokladfondant", description: "Varm chokladfondant med glass.", priceIncVat: 85 },
  { categorySlug: "desserter", name: "Crème Brûlée", slug: "creme-brulee", description: "Klassisk crème brûlée.", priceIncVat: 75 },
  { categorySlug: "desserter", name: "Klassisk Tiramisu", slug: "klassisk-tiramisu", description: "Italiensk tiramisu.", priceIncVat: 89 },
  { categorySlug: "desserter", name: "Pavlova", slug: "pavlova", description: "Maräng med bär och grädde.", priceIncVat: 79 },
  { categorySlug: "desserter", name: "Vaniljglass", slug: "vaniljglass", description: "Vaniljglass med tillbehör.", priceIncVat: 89 },
  { categorySlug: "desserter", name: "Husets ostar", slug: "husets-ostar", description: "Utvalda ostar med tillbehör.", priceIncVat: 145 },
  { categorySlug: "desserter", name: "KTC", slug: "ktc", description: "Husets specialdessert.", priceIncVat: 135 },
  { categorySlug: "desserter", name: "Dagens Cheesecake", slug: "dagens-cheesecake", description: "Dagens cheesecake.", priceIncVat: 75 },
];

/** Homepage featured dishes (original seed order). */
export const FEATURED_MENU_SLUGS = [
  "entrecote",
  "grillad-lammracks",
  "halstrad-roding",
  "rivas-kottbullar",
] as const;

/** Course-type categories only (children of RIVAS MENY), for legacy helpers. */
export function getMenuByCategory() {
  return MENU_CATEGORIES.filter((c) => c.parentSlug === "rivas-meny").map((category) => ({
    ...category,
    items: MENU_ITEMS.filter((item) => item.categorySlug === category.slug),
  }));
}

export function getFeaturedMenuItems(): MenuItem[] {
  return FEATURED_MENU_SLUGS.map(
    (slug) => MENU_ITEMS.find((item) => item.slug === slug)!,
  );
}
