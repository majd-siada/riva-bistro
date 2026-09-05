import type { OpeningHour } from "@/lib/api";
import { business } from "@/config/business";

export function fmtClock(t: string | null | undefined): string {
  if (!t) return "";
  return t.slice(0, 5);
}

export function formatDayHours(h: OpeningHour): string {
  if (h.is_closed || !h.opens_at) return "Stängt";
  // Keep midnight as 00:00 to match the official Friday close display.
  return `${fmtClock(h.opens_at)}–${fmtClock(h.closes_at)}`;
}

export function todayHours(hours: OpeningHour[]): OpeningHour | undefined {
  const jsDay = new Date().getDay();
  const weekday = jsDay === 0 ? 6 : jsDay - 1;
  return hours.find((h) => h.weekday === weekday);
}

export function todayHoursLabel(hours: OpeningHour[]): string {
  const today = todayHours(hours);
  if (!today) return business.restaurantHoursLabel;
  return `Idag ${formatDayHours(today)}`;
}

export function compactHoursLabel(hours: OpeningHour[]): string {
  if (!hours.length) return business.restaurantHoursLabel;
  const open = hours.filter((h) => !h.is_closed && h.opens_at);
  // Uninitialized API stubs (all closed) should not render as permanently closed.
  if (!open.length) return business.restaurantHoursLabel;
  const same = open.every(
    (h) => h.opens_at === open[0].opens_at && h.closes_at === open[0].closes_at,
  );
  if (same && open.length === 7) {
    return `Alla dagar ${fmtClock(open[0].opens_at)}–${fmtClock(open[0].closes_at)}`;
  }
  return business.restaurantHoursLabel;
}
