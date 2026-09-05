/**
 * Official Riva Bistro weekly opening hours — frontend display fallback.
 *
 * Must stay in sync with `apps/backend/reservations/official_hours.py`.
 * Live UI prefers GET /api/v1/hours/ when Admin has real times saved.
 * When the API returns uninitialized stubs (all closed / null times),
 * these official hours are used for public display.
 *
 * Friday closes at 00:00 (midnight) at the end of the Friday period.
 */

import type { OpeningHour } from "@/lib/api";

export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type OfficialDayHours = {
  weekday: WeekdayIndex;
  labelSv: string;
  opens: string; // HH:MM
  closes: string; // HH:MM (00:00 = midnight end-of-day)
  isClosed: boolean;
};

export const OFFICIAL_OPENING_HOURS: readonly OfficialDayHours[] = [
  { weekday: 0, labelSv: "Måndag", opens: "10:30", closes: "21:00", isClosed: false },
  { weekday: 1, labelSv: "Tisdag", opens: "10:30", closes: "21:00", isClosed: false },
  { weekday: 2, labelSv: "Onsdag", opens: "10:30", closes: "21:00", isClosed: false },
  { weekday: 3, labelSv: "Torsdag", opens: "10:30", closes: "21:00", isClosed: false },
  { weekday: 4, labelSv: "Fredag", opens: "11:30", closes: "00:00", isClosed: false },
  { weekday: 5, labelSv: "Lördag", opens: "10:30", closes: "23:00", isClosed: false },
  { weekday: 6, labelSv: "Söndag", opens: "10:30", closes: "21:00", isClosed: false },
];

/** Compact Swedish summary used when the hours API is unavailable. */
export const OFFICIAL_HOURS_LABEL =
  "Mån–Tor 10:30–21:00, Fre 11:30–00:00, Lör 10:30–23:00, Sön 10:30–21:00";

/** Convert official hours into the API OpeningHour shape for UI rendering. */
export function officialHoursAsOpeningHours(): OpeningHour[] {
  return OFFICIAL_OPENING_HOURS.map((d) => ({
    weekday: d.weekday,
    weekday_label: d.labelSv,
    opens_at: d.isClosed ? null : `${d.opens}:00`,
    closes_at: d.isClosed ? null : `${d.closes}:00`,
    is_closed: d.isClosed,
  }));
}

/**
 * True when the API returned placeholder rows (every day closed with no times),
 * which happens before OpeningHours are seeded in the database.
 */
export function isUninitializedHours(hours: OpeningHour[]): boolean {
  if (!hours.length) return true;
  return hours.every((h) => h.is_closed || (!h.opens_at && !h.closes_at));
}
