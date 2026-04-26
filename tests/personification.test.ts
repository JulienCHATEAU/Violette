import { describe, expect, it } from "vitest";
import { pickMessage } from "@/lib/personification/select";
import type { PersonificationCategory } from "@/lib/personification/types";

const NOW = new Date("2026-04-26T10:00:00.000Z");
const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

function plant(overrides: { id?: string; daysSinceWater?: number; hoursSinceWater?: number; freq?: number } = {}) {
  const { id = "p_test_001", daysSinceWater, hoursSinceWater, freq = 7 } = overrides;
  const offsetMs = hoursSinceWater !== undefined ? hoursSinceWater * HOUR_MS : (daysSinceWater ?? 1) * DAY_MS;
  return {
    id,
    lastWateredAt: new Date(NOW.getTime() - offsetMs),
    wateringFrequencyDays: freq,
  };
}

/** Generates N plants with deterministic-but-varying ids. */
function many(n: number, baseOverrides: Parameters<typeof plant>[0] = {}) {
  return Array.from({ length: n }, (_, i) => plant({ ...baseOverrides, id: `p_${i.toString().padStart(4, "0")}` }));
}

describe("pickMessage — determinism", () => {
  it("returns the same result for the same plant on the same day", () => {
    const p = plant({ daysSinceWater: 1 });
    const a = pickMessage(p, NOW);
    const b = pickMessage(p, NOW);
    expect(a).toEqual(b);
  });

  it("can return different results on different days (sampled)", () => {
    const p = plant({ daysSinceWater: 1 });
    const day1 = pickMessage(p, new Date("2026-04-26T10:00:00Z"));
    const day2 = pickMessage(p, new Date("2026-05-12T10:00:00Z"));
    const day3 = pickMessage(p, new Date("2026-06-01T10:00:00Z"));
    // At least one of the three should differ from the first.
    const allEqual = JSON.stringify(day1) === JSON.stringify(day2) && JSON.stringify(day2) === JSON.stringify(day3);
    expect(allEqual).toBe(false);
  });

  it("hour-of-day does not change the result within a UTC date", () => {
    const p = plant({ daysSinceWater: 1 });
    const morning = pickMessage(p, new Date("2026-04-26T05:00:00Z"));
    const evening = pickMessage(p, new Date("2026-04-26T22:00:00Z"));
    expect(morning).toEqual(evening);
  });
});

describe("pickMessage — thirsty rule", () => {
  it("returns thirsty (or null) when daysSinceWater > freq + 2", () => {
    // freq=7, water 12 days ago → 12 > 9 → thirsty rule fires
    const plants = many(200, { daysSinceWater: 12, freq: 7 });
    const results = plants.map((p) => pickMessage(p, NOW));
    const nonNull = results.filter((r): r is NonNullable<typeof r> => r !== null);
    // All non-null results must be thirsty (no other category leaks in)
    expect(nonNull.every((m) => m.category === "thirsty")).toBe(true);
    // Probability ~70% — sample size 200, allow generous tolerance
    expect(nonNull.length).toBeGreaterThan(100);
    expect(nonNull.length).toBeLessThan(180);
  });

  it("does not fire thirsty at the boundary daysSinceWater === freq + 2", () => {
    // 9 === freq+2 → not strictly greater, falls through
    const plants = many(50, { daysSinceWater: 9, freq: 7 });
    const results = plants.map((p) => pickMessage(p, NOW)).filter((r) => r !== null);
    expect(results.every((r) => r!.category !== "thirsty")).toBe(true);
  });
});

describe("pickMessage — watered_thanks rule", () => {
  it("returns watered_thanks (or null) when watered < 6h ago", () => {
    const plants = many(200, { hoursSinceWater: 2, freq: 7 });
    const results = plants.map((p) => pickMessage(p, NOW));
    const nonNull = results.filter((r): r is NonNullable<typeof r> => r !== null);
    expect(nonNull.every((m) => m.category === "watered_thanks")).toBe(true);
    // Probability ~50%
    expect(nonNull.length).toBeGreaterThan(70);
    expect(nonNull.length).toBeLessThan(140);
  });

  it("does not fire watered_thanks at the boundary hoursSinceWater === 6", () => {
    const plants = many(50, { hoursSinceWater: 6, freq: 7 });
    const results = plants.map((p) => pickMessage(p, NOW)).filter((r) => r !== null);
    expect(results.every((r) => r!.category !== "watered_thanks")).toBe(true);
  });
});

describe("pickMessage — long_time_no_see rule", () => {
  const lastSeen = new Date(NOW.getTime() - 10 * DAY_MS);

  it("returns long_time_no_see (or null) when lastSeenAt > 7 days", () => {
    const plants = many(200, { daysSinceWater: 1, freq: 7 });
    const results = plants.map((p) => pickMessage(p, NOW, lastSeen));
    const nonNull = results.filter((r): r is NonNullable<typeof r> => r !== null);
    expect(nonNull.every((m) => m.category === "long_time_no_see")).toBe(true);
    // Probability ~60%
    expect(nonNull.length).toBeGreaterThan(90);
    expect(nonNull.length).toBeLessThan(160);
  });

  it("is dormant when lastSeenAt is omitted (default behaviour today)", () => {
    const plants = many(50, { daysSinceWater: 1, freq: 7 });
    const results = plants.map((p) => pickMessage(p, NOW));
    // Falls back to greeting/general — never long_time_no_see
    const categories: PersonificationCategory[] = results
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .map((m) => m.category);
    expect(categories.every((c) => c !== "long_time_no_see")).toBe(true);
  });
});

describe("pickMessage — default greeting/general rule", () => {
  it("falls back to greeting/general when no specific rule fires", () => {
    const plants = many(300, { daysSinceWater: 1, freq: 7 });
    const results = plants.map((p) => pickMessage(p, NOW));
    const nonNull = results.filter((r): r is NonNullable<typeof r> => r !== null);
    expect(nonNull.every((m) => m.category === "greeting" || m.category === "general")).toBe(true);
    // Probability ~25%
    expect(nonNull.length).toBeGreaterThan(40);
    expect(nonNull.length).toBeLessThan(120);
  });
});

describe("pickMessage — input flexibility", () => {
  it("accepts string ISO dates as well as Date objects", () => {
    const p1 = plant({ daysSinceWater: 1 });
    const p2 = { ...p1, lastWateredAt: (p1.lastWateredAt as Date).toISOString() };
    expect(pickMessage(p1, NOW)).toEqual(pickMessage(p2, NOW));
  });
});
