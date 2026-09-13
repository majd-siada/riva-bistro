import { describe, expect, it } from "vitest";

import { businessFromProfile, publicSocialUrl } from "@/lib/public-business";

describe("publicSocialUrl", () => {
  it("hides empty and legacy placeholder URLs", () => {
    expect(publicSocialUrl("")).toBe("");
    expect(publicSocialUrl("https://instagram.com/rivabistro")).toBe("");
    expect(publicSocialUrl("https://facebook.com/rivabistro/")).toBe("");
  });

  it("keeps real profile URLs", () => {
    expect(publicSocialUrl("https://www.instagram.com/realriva/")).toBe(
      "https://www.instagram.com/realriva",
    );
  });
});

describe("businessFromProfile social", () => {
  it("does not fall back to placeholder social links", () => {
    const b = businessFromProfile({
      name: "Riva Bistro",
      tagline: "",
      street: "Hornsbergs Strand 57",
      postal_code: "112 16",
      city: "Stockholm",
      country: "SE",
      area: "Kungsholmen",
      phone: "08-704 20 50",
      phone_e164: "+4687042050",
      email: "info@rivabistro.se",
      map_url: "https://example.com",
      social_instagram: "https://instagram.com/rivabistro",
      social_facebook: "",
      social_verified: false,
      kitchen_hours: "",
    });
    expect(b.social.instagram).toBe("");
    expect(b.social.facebook).toBe("");
  });
});
