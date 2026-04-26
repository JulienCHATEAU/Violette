import { MESSAGES } from "./messages";
import type { PersonificationCategory, PersonificationInput, PersonificationMessage } from "./types";

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

/** FNV-1a 32-bit hash — fast, stable, good distribution for short keys. */
function fnv1a(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 PRNG — single-seed, fast, deterministic, good for one-off picks. */
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function asDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

/**
 * Decision rules for which category to consider, in priority order.
 * Returns `{ category, probability }` or `null` if no rule matches.
 */
function pickCategory(
  daysSinceWater: number,
  hoursSinceWater: number,
  daysSinceSeen: number | null,
  freqDays: number,
): { category: PersonificationCategory; probability: number } {
  if (daysSinceWater > freqDays + 2) return { category: "thirsty", probability: 0.7 };
  if (hoursSinceWater < 6) return { category: "watered_thanks", probability: 0.5 };
  if (daysSinceSeen !== null && daysSinceSeen > 7) return { category: "long_time_no_see", probability: 0.6 };
  return { category: "greeting", probability: 0.25 };
}

/**
 * Pick a personification message for a plant on a given day.
 *
 * Determinism: for a given `(plant.id, YYYY-MM-DD)` pair the same message (or `null`)
 * is returned every time within that day. This lets the client compute the bubble at
 * mount without re-randomising on every re-render.
 *
 * @param plant   subset of Plant fields needed for the rules
 * @param now     reference time (test seam)
 * @param lastSeenAt optional last-app-visit timestamp; when omitted the
 *                   `long_time_no_see` rule is skipped (it requires data we don't
 *                   currently persist in the schema).
 */
export function pickMessage(
  plant: PersonificationInput,
  now: Date,
  lastSeenAt?: Date | string | null,
): PersonificationMessage | null {
  const lastWater = asDate(plant.lastWateredAt);
  const sinceWaterMs = now.getTime() - lastWater.getTime();
  const daysSinceWater = sinceWaterMs / DAY_MS;
  const hoursSinceWater = sinceWaterMs / HOUR_MS;

  let daysSinceSeen: number | null = null;
  if (lastSeenAt) {
    daysSinceSeen = (now.getTime() - asDate(lastSeenAt).getTime()) / DAY_MS;
  }

  const { category, probability } = pickCategory(
    daysSinceWater,
    hoursSinceWater,
    daysSinceSeen,
    plant.wateringFrequencyDays,
  );

  const seed = fnv1a(`${plant.id}:${isoDate(now)}`);
  const rand = mulberry32(seed);

  // First draw decides whether the bubble fires.
  const gate = rand();
  if (gate >= probability) return null;

  // Second draw decides which message inside the chosen category.
  const candidates =
    category === "greeting"
      ? MESSAGES.filter((m) => m.category === "greeting" || m.category === "general")
      : MESSAGES.filter((m) => m.category === category);
  if (candidates.length === 0) return null;

  const idx = Math.floor(rand() * candidates.length);
  return candidates[idx] ?? null;
}
