/**
 * Official Riva Bistro weekly opening hours — frontend display fallback.
 *
 * Must stay in sync with `apps/backend/reservations/official_hours.py`.
 * Live UI should prefer GET /api/v1/hours/ (Admin → Öppettider) as the
 * runtime source of truth; this module is only a static fallback label.
 *
 * Friday closes at 00:00 (midnight) at the end of the Friday period.
 */

export type OfficialDayHours = {
  weekday: number;
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
] as const;

/** Compact Swedish summary used when the hours API is unavailable. */
export const OFFICIAL_HOURS_LABEL =
  "Mån–Tor 10:30–21:00, Fre 11:30–00:00, Lör 10:30–23:00, Sön 10:30–21:00";
