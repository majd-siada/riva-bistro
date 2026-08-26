import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        riva: {
          black: "var(--riva-black)",
          "charcoal-deep": "var(--riva-charcoal-deep)",
          charcoal: "var(--riva-charcoal)",
          ivory: "var(--riva-ivory)",
          mist: "var(--riva-mist)",
          gold: "var(--riva-gold)",
          "gold-muted": "var(--riva-gold-muted)",
          teal: "var(--riva-teal)",
          "teal-muted": "var(--riva-teal-muted)",
          error: "var(--riva-error)",
          success: "var(--riva-success)",
        },
        surface: {
          default: "var(--surface-default)",
          elevated: "var(--surface-elevated)",
          subtle: "var(--surface-subtle)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
      boxShadow: {
        subtle: "var(--shadow-subtle)",
        elevated: "var(--shadow-elevated)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
      },
      backgroundImage: {
        "riva-hero":
          "radial-gradient(ellipse at 20% 20%, rgba(94,139,139,0.08), transparent 45%), radial-gradient(ellipse at 80% 0%, rgba(191,160,106,0.06), transparent 40%), linear-gradient(180deg, #0a0a0a 0%, #0f1418 55%, #0a0a0a 100%)",
        "riva-warm-overlay":
          "linear-gradient(180deg, transparent 40%, rgba(10,10,10,0.85) 100%)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in var(--duration-normal) var(--ease-out)",
        "slide-in-right": "slide-in-right var(--duration-normal) var(--ease-out)",
      },
    },
  },
  plugins: [],
};

export default config;
