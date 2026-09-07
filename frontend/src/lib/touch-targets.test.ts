import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("touch target sizing (static)", () => {
  it("public menu chips declare min touch height classes", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/features/menu/menu-category-nav.tsx"),
      "utf8",
    );
    expect(source).toMatch(/min-h-11/);
    expect(source).toMatch(/min-h-10/);
  });

  it("reservation slot chips declare min-h-11", () => {
    const source = readFileSync(
      join(
        process.cwd(),
        "src/components/features/booking/reservation-form.tsx",
      ),
      "utf8",
    );
    expect(source).toMatch(/min-h-11/);
  });

  it("button sizes use at least h-10/h-11 for sm/default/icon", () => {
    const source = readFileSync(
      join(process.cwd(), "src/components/ui/button.tsx"),
      "utf8",
    );
    expect(source).toMatch(/default: "h-11 min-h-11/);
    expect(source).toMatch(/sm: "h-10 min-h-10/);
    expect(source).toMatch(/icon: "h-11 w-11 min-h-11 min-w-11"/);
  });
});
