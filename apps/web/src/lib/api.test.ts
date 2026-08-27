import { describe, expect, it } from "vitest";

import { resolveImageUrl } from "@/lib/api";

describe("resolveImageUrl", () => {
  it("returns an empty string for empty input", () => {
    expect(resolveImageUrl("")).toBe("");
  });

  it("passes through absolute URLs unchanged", () => {
    expect(resolveImageUrl("https://example.com/a.jpg")).toBe("https://example.com/a.jpg");
    expect(resolveImageUrl("http://example.com/a.jpg")).toBe("http://example.com/a.jpg");
  });

  it("resolves a relative media path against the public API origin", () => {
    const resolved = resolveImageUrl("/media/menu/dish.webp");
    expect(resolved.endsWith("/media/menu/dish.webp")).toBe(true);
    expect(resolved.startsWith("http")).toBe(true);
  });
});
