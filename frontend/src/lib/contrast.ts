/**
 * Design-token contrast helpers (WCAG 2.x relative luminance).
 * Used by unit tests — not a claim of full-page WCAG certification.
 */

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(fg: string, bg: string): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Core Riva tokens from globals.css :root */
export const RIVA_TOKENS = {
  black: "#050404",
  surface: "#0d0b0a",
  card: "#120f0e",
  cream: "#f5f2e8",
  muted: "#ada89c",
  gold: "#b8853d",
  goldLight: "#c69a52",
  error: "#c45c5c",
  success: "#5e8b6e",
} as const;
