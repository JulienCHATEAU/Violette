import { describe, expect, it } from "vitest";
import type { Plant } from "@prisma/client";
import { generatePlantMessage } from "../src/lib/push/generate-message";
import { ALL_TEMPLATES } from "../src/lib/push/templates";

function mkPlant(over: Partial<Plant> = {}): Plant {
  return {
    id: "p1",
    name: "Monstera",
    nickname: "Gérard",
    description: null,
    species: "Monstera deliciosa",
    wateringFrequencyDays: 7,
    lastWateredAt: new Date(),
    sunlightExposure: "indirect_light",
    humidity: "medium",
    temperatureRange: null,
    notes: null,
    photo: null,
    photoMime: null,
    ownerId: "u1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  } as Plant;
}

const DAY = 86_400_000;
const now = new Date("2026-04-20T10:00:00");

describe("generatePlantMessage", () => {
  it("returns null when plant isn't due yet (watering_due)", () => {
    const plant = mkPlant({ lastWateredAt: new Date(now.getTime() - 2 * DAY) });
    expect(generatePlantMessage(plant, "watering_due", { now })).toBeNull();
  });

  it("returns a rendered message when due", () => {
    const plant = mkPlant({ lastWateredAt: new Date(now.getTime() - 7 * DAY) });
    const msg = generatePlantMessage(plant, "watering_due", { now });
    expect(msg).not.toBeNull();
    expect(msg!.templateId).toBeTruthy();
    expect(msg!.body).not.toMatch(/\{\{/);
  });

  it("returns a rendered message for greeting regardless of watering", () => {
    const plant = mkPlant({ lastWateredAt: new Date(now.getTime() - 1 * DAY) });
    const msg = generatePlantMessage(plant, "greeting", { now });
    expect(msg).not.toBeNull();
    expect(msg!.body).not.toMatch(/\{\{/);
  });

  it("respects recentIds and picks a fresh template", () => {
    const plant = mkPlant({ lastWateredAt: new Date(now.getTime() - 7 * DAY) });
    const due = ALL_TEMPLATES.filter((t) => t.contexts.includes("due"));
    const allButOne = due.slice(0, -1).map((t) => t.id);
    const msg = generatePlantMessage(plant, "watering_due", { now, recentIds: allButOne });
    expect(msg!.templateId).toBe(due[due.length - 1]!.id);
  });

  it("produces messages without stray placeholder braces across the full catalog", () => {
    const plant = mkPlant({ lastWateredAt: new Date(now.getTime() - 10 * DAY) });
    for (const template of ALL_TEMPLATES) {
      const msg = generatePlantMessage(plant, template.contexts.includes("greeting") ? "greeting" : "watering_due", { now, recentIds: ALL_TEMPLATES.filter((t) => t.id !== template.id).map((t) => t.id) });
      if (msg) {
        expect(msg.body).not.toMatch(/\{\{/);
        expect(msg.title).not.toMatch(/\{\{/);
      }
    }
  });
});
