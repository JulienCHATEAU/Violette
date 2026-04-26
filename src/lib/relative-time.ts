const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

/**
 * Compact French relative-time formatter.
 *
 * Returns short, conversational labels suitable for timeline entries on the
 * plant detail screen. Past dates only — future dates are clamped to the
 * boundary "à l'instant" since the app doesn't have any forward-looking events
 * in its timeline.
 *
 * Examples (now = 2026-04-26):
 *   2026-04-26 11:59 → "à l'instant"
 *   2026-04-26 09:00 → "il y a 3h"
 *   2026-04-25       → "hier"
 *   2026-04-19       → "il y a 7j"
 *   2026-03-26       → "il y a 1 mois"
 *   2025-04-26       → "il y a 1 an"
 *   2024-04-26       → "il y a 2 ans"
 */
export function relativeTimeFr(date: Date | string, now: Date = new Date()): string {
  const d = date instanceof Date ? date : new Date(date);
  const diff = now.getTime() - d.getTime();

  if (diff < MINUTE_MS) return "à l'instant";
  if (diff < HOUR_MS) {
    const m = Math.floor(diff / MINUTE_MS);
    return `il y a ${m} min`;
  }
  if (diff < DAY_MS) {
    const h = Math.floor(diff / HOUR_MS);
    return `il y a ${h} h`;
  }
  if (diff < 2 * DAY_MS) return "hier";
  if (diff < MONTH_MS) {
    const d = Math.floor(diff / DAY_MS);
    return `il y a ${d} j`;
  }
  if (diff < YEAR_MS) {
    const months = Math.floor(diff / MONTH_MS);
    return months === 1 ? "il y a 1 mois" : `il y a ${months} mois`;
  }
  const years = Math.floor(diff / YEAR_MS);
  return years === 1 ? "il y a 1 an" : `il y a ${years} ans`;
}
