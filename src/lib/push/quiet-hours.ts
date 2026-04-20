/**
 * Determines whether "now" falls inside a quiet-hours window (in local server TZ).
 * Window can wrap midnight (e.g. 22→8). null bounds = disabled.
 */
export function isQuietNow(
  quietHoursStart: number | null | undefined,
  quietHoursEnd: number | null | undefined,
  now: Date = new Date(),
): boolean {
  if (quietHoursStart == null || quietHoursEnd == null) return false;
  if (quietHoursStart === quietHoursEnd) return false;
  const h = now.getHours();
  if (quietHoursStart < quietHoursEnd) {
    return h >= quietHoursStart && h < quietHoursEnd;
  }
  // wraps midnight: e.g. 22..8 → quiet if h>=22 OR h<8
  return h >= quietHoursStart || h < quietHoursEnd;
}
