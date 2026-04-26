/**
 * Design system colors — typed re-export of the Tailwind palette.
 *
 * Use these constants when you need a color in TypeScript (framer-motion variants,
 * SVG fills, dynamic styles). For class names, prefer Tailwind utilities directly
 * (`bg-terracotta-500`, `text-ink-800`).
 */
export const terracotta = {
  50: "#FBF1EC",
  100: "#F1D8CC",
  200: "#E5BBA8",
  400: "#D17B5C",
  500: "#C4583E",
  600: "#A8402A",
  700: "#7A2A1A",
} as const;

export const moss = {
  50: "#EFF1EA",
  100: "#DBE0CC",
  200: "#B9C3A0",
  400: "#7D8E6A",
  500: "#5C6F4F",
  600: "#445436",
  700: "#2D3A22",
} as const;

export const paper = {
  50: "#FAF6EC",
  100: "#F4ECDD",
  200: "#E9DEC4",
  300: "#D9C9A4",
} as const;

export const ink = {
  400: "#8C7A6E",
  600: "#5A4A40",
  800: "#2B1F1A",
  900: "#1A1310",
} as const;

export const colors = { terracotta, moss, paper, ink } as const;
export type ColorScale = typeof terracotta | typeof moss | typeof paper | typeof ink;
