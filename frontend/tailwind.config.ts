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
          black: "var(--riva-black)",
          surface: "var(--riva-surface)",
          card: "var(--riva-card)",
          cream: "var(--riva-cream)",
          muted: "var(--riva-muted)",
          gold: "var(--riva-gold)",
          "gold-light": "var(--riva-gold-light)",
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
          "linear-gradient(180deg, transparent 20%, rgba(5,4,4,0.85) 100%)",
        "riva-hero-veil":
          "linear-gradient(90deg, rgba(5,4,4,0.92) 0%, rgba(5,4,4,0.55) 45%, rgba(5,4,4,0.25) 100%)",
        "riva-scene-veil":
          "linear-gradient(180deg, rgba(5,4,4,0.15) 0%, rgba(5,4,4,0.75) 100%)",
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
