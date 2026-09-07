import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("Next.js security headers configuration", () => {
  const source = readFileSync(
    join(process.cwd(), "next.config.ts"),
    "utf8",
  );

  it("declares nosniff, referrer, frame, and permissions headers", () => {
    expect(source).toContain("X-Content-Type-Options");
    expect(source).toContain("nosniff");
    expect(source).toContain("Referrer-Policy");
    expect(source).toContain("strict-origin-when-cross-origin");
    expect(source).toContain("X-Frame-Options");
    expect(source).toContain("DENY");
    expect(source).toContain("Permissions-Policy");
    expect(source).toMatch(/camera=\(\)/);
  });

  it("keeps CSP in Report-Only mode (not enforced)", () => {
    expect(source).toContain("Content-Security-Policy-Report-Only");
    expect(source).not.toMatch(
      /key:\s*"Content-Security-Policy"[^-]/
    );
  });
});

describe("middleware security headers", () => {
  it("sets the same baseline headers as next.config", () => {
    const mw = readFileSync(
      join(process.cwd(), "src/middleware.ts"),
      "utf8",
    );
    expect(mw).toContain("X-Content-Type-Options");
    expect(mw).toContain("nosniff");
    expect(mw).toContain("Referrer-Policy");
    expect(mw).toContain("X-Frame-Options");
    expect(mw).toContain("Permissions-Policy");
    expect(mw).toContain("Content-Security-Policy-Report-Only");
  });
});
