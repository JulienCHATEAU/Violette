import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Legacy palette — kept for existing screens (will be migrated in Phase 2).
        violet: {
          50: "#f5f1fb",
          100: "#e8ddf5",
          200: "#d4baeb",
          300: "#b794d8",
          400: "#a079c6",
          500: "#8e6bb8",
          600: "#7a559f",
          700: "#5e3f7e",
          800: "#452c5e",
          900: "#2f1d40",
        },
        sage: {
          50: "#f3f6f2",
          100: "#e2ebdf",
          200: "#c6d6c2",
          300: "#a3ba9e",
          400: "#879e82",
          500: "#7a9a77",
          600: "#5e7e5e",
          700: "#4c6a4a",
          800: "#3a4f38",
          900: "#263427",
        },
        // Design system "Herbier moderne" — primary palette
        terracotta: {
          50: "#FBF1EC",
          100: "#F1D8CC",
          200: "#E5BBA8",
          400: "#D17B5C",
          500: "#C4583E",
          600: "#A8402A",
          700: "#7A2A1A",
        },
        moss: {
          50: "#EFF1EA",
          100: "#DBE0CC",
          200: "#B9C3A0",
          400: "#7D8E6A",
          500: "#5C6F4F",
          600: "#445436",
          700: "#2D3A22",
        },
        paper: {
          50: "#FAF6EC",
          100: "#F4ECDD",
          200: "#E9DEC4",
          300: "#D9C9A4",
        },
        ink: {
          400: "#8C7A6E",
          600: "#5A4A40",
          800: "#2B1F1A",
          900: "#1A1310",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: {
        "organic-1": "28px 36px 28px 40px",
        "organic-2": "36px 28px 40px 28px",
        "organic-3": "32px 32px 40px 28px",
        "pill-organic": "22px 26px 22px 26px",
      },
      boxShadow: {
        soft: "0 2px 10px -2px rgb(94 63 126 / 0.08)",
        paper: "0 1px 2px rgba(43,31,26,.06), 0 8px 24px -12px rgba(43,31,26,.18)",
        lift: "0 2px 4px rgba(43,31,26,.08), 0 18px 38px -16px rgba(43,31,26,.25)",
        press: "inset 0 2px 4px rgba(43,31,26,.10)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(.34, 1.56, .64, 1)",
        organic: "cubic-bezier(.4, 0, .2, 1)",
      },
      transitionDuration: {
        "180": "180ms",
        "250": "250ms",
        "400": "400ms",
      },
      keyframes: {
        "bubble-float": {
          "0%, 100%": { transform: "translateY(0) rotate(var(--bubble-tilt, -3deg))" },
          "50%": { transform: "translateY(-4px) rotate(calc(var(--bubble-tilt, -3deg) + 1deg))" },
        },
      },
      animation: {
        "bubble-float": "bubble-float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
