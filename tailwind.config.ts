import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary — inspired by Viola odorata (flower)
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
        // Secondary — soft sage foliage
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
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: "0 2px 10px -2px rgb(94 63 126 / 0.08)",
        lift: "0 8px 24px -8px rgb(94 63 126 / 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
