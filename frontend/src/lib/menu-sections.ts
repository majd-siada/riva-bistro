/** Canonical public menu section tabs — labels match customer-facing UI. */
export const MENU_SECTION_TABS = [
  { slug: "dagens-lunch", label: "Dagens lunch" },
  { slug: "rivas-meny", label: "RIVAS MENY" },
  { slug: "take-away", label: "TAKE AWAY" },
  { slug: "stora-sallskapsmeny", label: "STORA SÄLLSKAPSMENY" },
  { slug: "snacks-drinkar", label: "SNACKS & DRINKAR" },
  { slug: "dryck", label: "DRYCK" },
] as const;

export type MenuSectionSlug = (typeof MENU_SECTION_TABS)[number]["slug"];
