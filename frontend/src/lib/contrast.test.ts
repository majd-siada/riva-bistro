import { describe, expect, it } from "vitest";

import { contrastRatio, RIVA_TOKENS } from "@/lib/contrast";

describe("Riva token contrast (WCAG AA reference)", () => {
  const { black, surface, card, cream, muted, gold, error, success } = RIVA_TOKENS;

  it("cream body text meets AA normal (≥4.5) on black/surface/card", () => {
    expect(contrastRatio(cream, black)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(cream, surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(cream, card)).toBeGreaterThanOrEqual(4.5);
  });

  it("muted supporting text meets AA normal on black/surface/card", () => {
    expect(contrastRatio(muted, black)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(muted, surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(muted, card)).toBeGreaterThanOrEqual(4.5);
  });

  it("gold labels meet AA normal on black/surface", () => {
    expect(contrastRatio(gold, black)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(gold, surface)).toBeGreaterThanOrEqual(4.5);
  });

  it("error and success colors meet AA normal on black", () => {
    expect(contrastRatio(error, black)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(success, black)).toBeGreaterThanOrEqual(4.5);
  });

  it("black text on gold (primary CTA style) meets AA normal", () => {
    expect(contrastRatio(black, gold)).toBeGreaterThanOrEqual(4.5);
  });
});
