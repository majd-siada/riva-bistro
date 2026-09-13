import { describe, expect, it } from "vitest";

import {
  CACHE_REVALIDATE_SECONDS,
  resolveFetchCacheOptions,
  resolveImageUrl,
} from "@/lib/api";

describe("resolveImageUrl", () => {
  it("returns an empty string for empty input", () => {
    expect(resolveImageUrl("")).toBe("");
  });

  it("passes through absolute URLs unchanged", () => {
    expect(resolveImageUrl("https://example.com/a.jpg")).toBe(
      "https://example.com/a.jpg",
    );
    expect(resolveImageUrl("http://example.com/a.jpg")).toBe(
      "http://example.com/a.jpg",
    );
  });

  it("resolves a relative media path against the public API origin", () => {
    const resolved = resolveImageUrl("/media/menu/dish.webp");
    expect(resolved.endsWith("/media/menu/dish.webp")).toBe(true);
    expect(resolved.startsWith("http")).toBe(true);
  });

  it("resolves gallery media paths the same way as menu", () => {
    const resolved = resolveImageUrl("/media/gallery/room.jpg");
    expect(resolved).toMatch(/^https?:\/\//);
    expect(resolved.endsWith("/media/gallery/room.jpg")).toBe(true);
  });

  it("leaves Next.js public asset paths unchanged", () => {
    expect(resolveImageUrl("/scenes/hero-food.jpg")).toBe(
      "/scenes/hero-food.jpg",
    );
    expect(resolveImageUrl("/menu/entrecote.jpg")).toBe("/menu/entrecote.jpg");
  });
});

describe("fetch cache options", () => {
  it("uses no-store when revalidate is omitted (writes/availability/health)", () => {
    expect(resolveFetchCacheOptions()).toEqual({ cache: "no-store" });
    expect(resolveFetchCacheOptions({})).toEqual({ cache: "no-store" });
  });

  it("uses next.revalidate for read-only catalog/content TTLs", () => {
    expect(
      resolveFetchCacheOptions({
        revalidate: CACHE_REVALIDATE_SECONDS.catalog,
      }),
    ).toEqual({ next: { revalidate: 60 } });
    expect(
      resolveFetchCacheOptions({ revalidate: CACHE_REVALIDATE_SECONDS.hours }),
    ).toEqual({ next: { revalidate: 300 } });
    expect(
      resolveFetchCacheOptions({ revalidate: CACHE_REVALIDATE_SECONDS.news }),
    ).toEqual({ next: { revalidate: 120 } });
    expect(
      resolveFetchCacheOptions({
        revalidate: CACHE_REVALIDATE_SECONDS.gallery,
      }),
    ).toEqual({ next: { revalidate: 300 } });
  });
});
