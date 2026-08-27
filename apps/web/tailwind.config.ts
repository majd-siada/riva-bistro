import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", md: "2rem", lg: "2.5rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        riva: {
          cream: "var(--riva-cream)",
          "cream-2": "var(--riva-cream-2)",
          ivory: "var(--riva-ivory)",
          ink: "var(--riva-ink)",
          "ink-soft": "var(--riva-ink-soft)",
          taupe: "var(--riva-taupe)",
          gold: "var(--riva-gold)",
          "gold-soft": "var(--riva-gold-soft)",
          teal: "var(--riva-teal)",
          "teal-soft": "var(--riva-teal-soft)",
          charcoal: "var(--riva-charcoal)",
          "charcoal-2": "var(--riva-charcoal-2)",
          error: "var(--riva-error)",
          success: "var(--riva-success)",
        },
        "on-dark": {
          DEFAULT: "var(--text-on-dark)",
          muted: "var(--text-on-dark-muted)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        subtle: "var(--shadow-subtle)",
        card: "var(--shadow-card)",
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
      maxWidth: {
        prose: "68ch",
      },
      backgroundImage: {
        "riva-image-fade":
          "linear-gradient(180deg, transparent 30%, rgba(33,29,24,0.78) 100%)",
        "riva-hero-veil":
          "linear-gradient(180deg, rgba(33,29,24,0.35) 0%, rgba(33,29,24,0.55) 55%, rgba(33,29,24,0.82) 100%)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in var(--duration-slow) var(--ease-out) both",
        "slide-in-left": "slide-in-left var(--duration-normal) var(--ease-out)",
      },
    },
  },
  plugins: [],
};

export default config;
