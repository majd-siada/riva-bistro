import { describe, expect, it } from "vitest";

import { formatPrice } from "@/lib/format";

describe("formatPrice", () => {
  it("formats a numeric amount as Swedish kronor", () => {
    const result = formatPrice(125);
    expect(result).toContain("125");
    expect(result.toLowerCase()).toContain("kr");
  });

  it("accepts a numeric string from the API", () => {
    const result = formatPrice("812.50");
    expect(result).toContain("812");
    expect(result.toLowerCase()).toContain("kr");
  });

  it("returns an empty string for non-numeric input", () => {
    expect(formatPrice("abc")).toBe("");
  });
});
