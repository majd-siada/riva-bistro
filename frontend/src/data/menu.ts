/**
 * Fallback public menu if the catalog API is unreachable or empty.
 *
 * Kept intentionally for resilience: production prefers Django catalog
 * (admin CMS → GET /api/v1/menu/). This static copy is only used when the
 * API fails so the site still shows dishes instead of an empty menu.
 * Prices inkl. moms (12 %). Do not treat this as the source of truth once
 * the catalog is seeded in production.
 */

export interface MenuCategory {
  name: string;
  slug: string;
  description: string;
}

export interface MenuItem {
  categorySlug: string;
  name: string;
  slug: string;
  description: string;
  priceIncVat: number;
}

export const MENU_CATEGORIES: MenuCategory[] = [
  { name: "Varmrätter", slug: "varmratter", description: "Husets varma rätter, tillagade med omsorg." },
  { name: "Sallader", slug: "sallader", description: "Fräscha sallader med säsongens råvaror." },
  { name: "Pasta", slug: "pasta", description: "Italienskt hantverk, à la Riva." },
  { name: "Barnmeny", slug: "barnmeny", description: "För våra minsta gäster." },
  { name: "Desserter", slug: "desserter", description: "Söta avslut på måltiden." },
];

export const MENU_ITEMS: MenuItem[] = [
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

export function getMenuByCategory() {
  return MENU_CATEGORIES.map((category) => ({
    ...category,
    items: MENU_ITEMS.filter((item) => item.categorySlug === category.slug),
  }));
}

export function getFeaturedMenuItems(): MenuItem[] {
  return FEATURED_MENU_SLUGS.map(
    (slug) => MENU_ITEMS.find((item) => item.slug === slug)!,
  );
}
