import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BreadcrumbJsonLd, MenuJsonLd, openingHoursSpecification } from "@/components/seo/json-ld";
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

describe("openingHoursSpecification", () => {
  it("maps the same CMS hours shape the public UI uses into schema.org", () => {
    const spec = openingHoursSpecification([
      {
        weekday: 0,
        weekday_label: "Måndag",
        opens_at: "11:00:00",
        closes_at: "22:00:00",
        is_closed: false,
      },
      {
        weekday: 1,
        weekday_label: "Tisdag",
        opens_at: null,
        closes_at: null,
        is_closed: true,
      },
    ]);
    expect(spec).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Monday",
        opens: "11:00",
        closes: "22:00",
      },
    ]);
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
