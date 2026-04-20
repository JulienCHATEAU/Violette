import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#f1faf1",
          100: "#ddf2dd",
          200: "#bde4bd",
          400: "#63c063",
          500: "#3ea53e",
          600: "#2d8630",
          700: "#256a28",
          900: "#123a14",
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
