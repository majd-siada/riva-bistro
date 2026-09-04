import { describe, expect, it } from "vitest";

import { formatDayHours, fmtClock } from "@/lib/hours";

describe("hours helpers", () => {
  it("formats HH:MM:SS clocks as HH:MM", () => {
    expect(fmtClock("16:00:00")).toBe("16:00");
  });

  it("labels closed days", () => {
    expect(
      formatDayHours({
        weekday: 0 as const,
        weekday_label: "Måndag",
        opens_at: null,
        closes_at: null,
        is_closed: true,
      }),
    ).toBe("Stängt");
  });
});
