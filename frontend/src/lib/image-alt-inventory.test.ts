import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function walkTsx(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walkTsx(full, out);
    } else if (name.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

describe("image alt inventory (source)", () => {
  const roots = [
    join(process.cwd(), "src/app"),
    join(process.cwd(), "src/components"),
  ];
  const files = roots.flatMap((r) => walkTsx(r));

  it("finds TSX sources to scan", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it("requires alt= on next/image and RestaurantImage JSX usages", () => {
    const offenders: string[] = [];
    for (const file of files) {
      if (file.includes(".test.")) continue;
      const src = readFileSync(file, "utf8");
      // Rough JSX opener scan — each <Image / <RestaurantImage should include alt nearby.
      const re = /<(Image|RestaurantImage)\b[\s\S]*?>/g;
      let match: RegExpExecArray | null;
      while ((match = re.exec(src))) {
        const tag = match[0];
        // Self-closing or multi-line: also peek ahead ~400 chars for alt=
        const window = src.slice(match.index, match.index + Math.max(tag.length, 400));
        if (!/\balt\s*=/.test(window)) {
          offenders.push(`${file}: ${tag.slice(0, 80)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("keeps decorative product placeholder emblem as empty alt", () => {
    const productImage = readFileSync(
      join(process.cwd(), "src/components/features/menu/product-image.tsx"),
      "utf8",
    );
    expect(productImage).toMatch(/alt=""/);
    expect(productImage).toMatch(/aria-hidden="true"/);
  });
});
