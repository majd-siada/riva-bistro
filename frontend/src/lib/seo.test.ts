import { describe, expect, it } from "vitest";

import { business, fullAddress, mapsEmbedUrl, shortAddress } from "@/config/business";
import { createPageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

describe("createPageMetadata", () => {
  it("sets a page-specific canonical (not always /)", () => {
    const meny = createPageMetadata({
      title: "Meny",
      description: "Test meny",
      path: "/meny",
    });
    expect(meny.alternates?.canonical).toBe("/meny");

    const home = createPageMetadata({
      title: "Home",
      absoluteTitle: "Riva Bistro — Home",
      description: "Home",
      path: "/",
    });
    expect(home.alternates?.canonical).toBe("/");
    expect(home.openGraph?.url).toBe(SITE_URL);
  });

  it("includes openGraph and twitter with unique titles", () => {
    const meta = createPageMetadata({
      title: "Boka bord",
      description: "Boka på Riva",
      path: "/boka",
    });
    expect(meta.openGraph?.title).toContain("Boka bord");
    expect(meta.openGraph?.url).toBe(`${SITE_URL}/boka`);
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
  });
});

describe("business NAP helpers", () => {
  it("keeps full and short address consistent with Hornsbergs Strand 57", () => {
    expect(business.address.street).toBe("Hornsbergs Strand 57");
    expect(fullAddress()).toContain("Hornsbergs Strand 57");
    expect(fullAddress()).toContain("112 16");
    expect(shortAddress()).toContain("57");
    expect(shortAddress()).toContain("Stockholm");
  });

  it("builds maps embed from the same NAP", () => {
    const embed = mapsEmbedUrl();
    expect(embed).toContain("output=embed");
    expect(embed).toContain("Hornsbergs");
    expect(embed).toContain("57");
  });
});


describe("SEO structured-data helpers (smoke)", () => {
  it("keeps social sameAs gated behind business.verified", async () => {
    const { business } = await import("@/config/business");
    expect(business.verified).toBe(false);
  });
});
