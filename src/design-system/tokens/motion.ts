/**
 * Motion tokens — keep all timing values in one place so the system stays coherent.
 * Doherty Threshold: any non-decorative animation should resolve in ≤ 400 ms.
 */
export const duration = {
  fast: 0.18,
  base: 0.25,
  slow: 0.4,
} as const;

export const easing = {
  spring: [0.34, 1.56, 0.64, 1] as const,
  organic: [0.4, 0, 0.2, 1] as const,
} as const;

export type DurationToken = keyof typeof duration;
export type EasingToken = keyof typeof easing;
