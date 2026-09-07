import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BreadcrumbJsonLd, MenuJsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/site";

describe("BreadcrumbJsonLd", () => {
  it("emits BreadcrumbList JSON-LD for two or more crumbs", () => {
    const html = renderToStaticMarkup(
      <BreadcrumbJsonLd
        items={[
          { name: "Hem", path: "/" },
          { name: "Meny", path: "/meny" },
        ]}
      />,
    );
    expect(html).toContain("application/ld+json");
    expect(html).toContain("BreadcrumbList");
    expect(html).toContain(`${SITE_URL}/meny`);
  });

  it("renders nothing for a single crumb", () => {
    const html = renderToStaticMarkup(
      <BreadcrumbJsonLd items={[{ name: "Hem", path: "/" }]} />,
    );
    expect(html).toBe("");
  });
});

describe("MenuJsonLd", () => {
  it("emits Menu / MenuSection / MenuItem from real catalog-shaped data", () => {
    const html = renderToStaticMarkup(
      <MenuJsonLd
        sections={[
          {
            name: "Förrätter",
            items: [
              {
                name: "Toast Skagen",
                description: "Klassiker",
                priceIncVat: 145,
              },
            ],
          },
        ]}
      />,
    );
    expect(html).toContain('"@type":"Menu"');
    expect(html).toContain("MenuSection");
    expect(html).toContain("Toast Skagen");
    expect(html).toContain("SEK");
  });

  it("emits nothing when all sections are empty", () => {
    const html = renderToStaticMarkup(
      <MenuJsonLd sections={[{ name: "Tom", items: [] }]} />,
    );
    expect(html).toBe("");
  });
});
