import { describe, expect, it } from "vitest";
import type { Plant } from "@prisma/client";
import { classifyWatering } from "../src/lib/push/context";

const DAY = 86_400_000;
const now = new Date("2026-04-20T12:00:00Z");

function mkPlant(daysSince: number, freq = 7): Plant {
  return {
    id: "p",
    name: "n",
    nickname: null,
    description: null,
    species: null,
    wateringFrequencyDays: freq,
    lastWateredAt: new Date(now.getTime() - daysSince * DAY),
    sunlightExposure: "indirect_light",
    humidity: "medium",
    temperature: null,
    notes: null,
    photo: null,
    photoMime: null,
    ownerId: "u",
    createdAt: now,
    updatedAt: now,
  } as Plant;
}

describe("classifyWatering", () => {
  it("returns null when not yet due", () => {
    expect(classifyWatering(mkPlant(3), now)).toBeNull();
    expect(classifyWatering(mkPlant(6), now)).toBeNull();
  });

  it("returns 'due' when exactly on frequency boundary", () => {
    expect(classifyWatering(mkPlant(7), now)).toBe("due");
  });

  it("returns 'overdue_light' for 1-2 days late", () => {
    expect(classifyWatering(mkPlant(8), now)).toBe("overdue_light");
    expect(classifyWatering(mkPlant(9), now)).toBe("overdue_light");
  });

  it("returns 'overdue_severe' for 3+ days late", () => {
    expect(classifyWatering(mkPlant(10), now)).toBe("overdue_severe");
    expect(classifyWatering(mkPlant(30), now)).toBe("overdue_severe");
  });
});
