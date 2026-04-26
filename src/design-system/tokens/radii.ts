/**
 * Organic border-radius tokens — irregular corners evoking pressed paper / leaves.
 */
export const radii = {
  organic1: "28px 36px 28px 40px",
  organic2: "36px 28px 40px 28px",
  organic3: "32px 32px 40px 28px",
  pillOrganic: "22px 26px 22px 26px",
} as const;

export type RadiusToken = keyof typeof radii;
