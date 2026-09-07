import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("AppShell a11y landmarks", () => {
  it("defines a skip link to #main-content in source", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/layout/app-shell.tsx"),
      "utf8",
    );
    expect(source).toContain('href="#main-content"');
    expect(source).toMatch(/Hoppa till innehåll/);
    expect(source).toContain('id="main-content"');
  });
});
