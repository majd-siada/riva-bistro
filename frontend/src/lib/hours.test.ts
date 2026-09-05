import { describe, expect, it } from "vitest";

import {
  isUninitializedHours,
  officialHoursAsOpeningHours,
  OFFICIAL_HOURS_LABEL,
} from "@/config/opening-hours";
import { compactHoursLabel, formatDayHours, fmtClock } from "@/lib/hours";

describe("hours helpers", () => {
  it("formats HH:MM:SS clocks as HH:MM", () => {
    expect(fmtClock("16:00:00")).toBe("16:00");
  });

  it("labels closed days", () => {
    expect(
      formatDayHours({
        weekday: 0,
        weekday_label: "Måndag",
        opens_at: null,
        closes_at: null,
        is_closed: true,
      }),
    ).toBe("Stängt");
  });

  it("formats Friday midnight close as 00:00", () => {
    expect(
      formatDayHours({
        weekday: 4,
        weekday_label: "Fredag",
        opens_at: "11:30:00",
        closes_at: "00:00:00",
        is_closed: false,
      }),
    ).toBe("11:30–00:00");
  });

  it("formats Mon–Thu and Sunday as 10:30–21:00", () => {
    expect(
      formatDayHours({
        weekday: 0,
        weekday_label: "Måndag",
        opens_at: "10:30:00",
        closes_at: "21:00:00",
        is_closed: false,
      }),
    ).toBe("10:30–21:00");
  });

  it("formats Saturday as 10:30–23:00", () => {
    expect(
      formatDayHours({
        weekday: 5,
        weekday_label: "Lördag",
        opens_at: "10:30:00",
        closes_at: "23:00:00",
        is_closed: false,
      }),
    ).toBe("10:30–23:00");
  });

  it("detects uninitialized API stubs", () => {
    const stubs = officialHoursAsOpeningHours().map((h) => ({
      ...h,
      opens_at: null,
      closes_at: null,
      is_closed: true,
    }));
    expect(isUninitializedHours(stubs)).toBe(true);
    expect(isUninitializedHours(officialHoursAsOpeningHours())).toBe(false);
  });

  it("renders official hours for every weekday", () => {
    const hours = officialHoursAsOpeningHours();
    expect(hours).toHaveLength(7);
    expect(formatDayHours(hours[0])).toBe("10:30–21:00");
    expect(formatDayHours(hours[4])).toBe("11:30–00:00");
    expect(formatDayHours(hours[5])).toBe("10:30–23:00");
  });

  it("does not treat uninitialized stubs as permanently closed in compact label", () => {
    const stubs = officialHoursAsOpeningHours().map((h) => ({
      ...h,
      opens_at: null,
      closes_at: null,
      is_closed: true,
    }));
    expect(compactHoursLabel(stubs)).toBe(OFFICIAL_HOURS_LABEL);
  });
});
