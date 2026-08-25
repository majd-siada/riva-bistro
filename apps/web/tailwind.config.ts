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
          ivory: "var(--riva-ivory)",
          gold: "var(--riva-gold)",
          "gold-muted": "var(--riva-gold-muted)",
          charcoal: "var(--riva-charcoal)",
          mist: "var(--riva-mist)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "riva-hero":
          "radial-gradient(ellipse at 20% 20%, rgba(196,165,116,0.12), transparent 45%), radial-gradient(ellipse at 80% 0%, rgba(244,240,230,0.08), transparent 40%), linear-gradient(180deg, #0a0a0a 0%, #121212 55%, #0a0a0a 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
