import { describe, expect, it } from "vitest";
import type { Plant } from "@prisma/client";
import { buildRenderContext, render } from "../src/lib/push/render";

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

describe("buildRenderContext", () => {
  const now = new Date("2026-04-20T10:00:00");

  it("uses nickname and computes days/frequency", () => {
    const plant = mkPlant({ lastWateredAt: new Date(now.getTime() - 9 * DAY) });
    const ctx = buildRenderContext(plant, now);
    expect(ctx.nickname).toBe("Gérard");
    expect(ctx.name).toBe("Monstera");
    expect(ctx.species).toBe("Monstera deliciosa");
    expect(ctx.lastWateredDays).toBe(9);
    expect(ctx.daysOverdue).toBe(2);
    expect(ctx.frequencyDays).toBe(7);
    expect(ctx.timeOfDay).toBe("matin");
  });

  it("falls back to name when nickname missing and clamps daysOverdue at 0", () => {
    const plant = mkPlant({ nickname: null, lastWateredAt: new Date(now.getTime() - 1 * DAY) });
    const ctx = buildRenderContext(plant, now);
    expect(ctx.nickname).toBe("Monstera");
    expect(ctx.daysOverdue).toBe(0);
  });

  it("uses 'plante' when species missing", () => {
    const ctx = buildRenderContext(mkPlant({ species: null }), now);
    expect(ctx.species).toBe("plante");
  });

  it("maps hours to time of day", () => {
    const base = mkPlant({ lastWateredAt: new Date() });
    expect(buildRenderContext(base, new Date("2026-04-20T08:00:00")).timeOfDay).toBe("matin");
    expect(buildRenderContext(base, new Date("2026-04-20T14:00:00")).timeOfDay).toBe("après-midi");
    expect(buildRenderContext(base, new Date("2026-04-20T20:00:00")).timeOfDay).toBe("soir");
  });
});

describe("render", () => {
  const baseCtx = {
    nickname: "Gérard",
    name: "Monstera",
    species: "Monstera deliciosa",
    daysOverdue: 3,
    lastWateredDays: 10,
    frequencyDays: 7,
    timeOfDay: "matin" as const,
    waterEmoji: "💧",
    plantEmoji: "🌿",
    loveEmoji: "💜",
    sadEmoji: "🥺",
  };

  it("substitutes placeholders", () => {
    expect(render("Hello {{nickname}}", baseCtx)).toBe("Hello Gérard");
    expect(render("{{daysOverdue}} jours en retard", baseCtx)).toBe("3 jours en retard");
  });

  it("handles multiple placeholders", () => {
    expect(render("{{nickname}} — {{waterEmoji}}", baseCtx)).toBe("Gérard — 💧");
  });

  it("applies 'plural' filter on numbers", () => {
    expect(render("{{daysOverdue}} jour{{daysOverdue:plural}}", baseCtx)).toBe("3 jours");
    expect(render("{{daysOverdue}} jour{{daysOverdue:plural}}", { ...baseCtx, daysOverdue: 1 })).toBe("1 jour");
    expect(render("{{daysOverdue}} jour{{daysOverdue:plural}}", { ...baseCtx, daysOverdue: 0 })).toBe("0 jour");
  });

  it("applies 'lower' and 'upper'", () => {
    expect(render("{{name:lower}}", baseCtx)).toBe("monstera");
    expect(render("{{name:upper}}", baseCtx)).toBe("MONSTERA");
  });

  it("leaves unknown placeholders as empty string", () => {
    expect(render("x{{unknownKey}}y", baseCtx)).toBe("xy");
  });

  it("ignores malformed tokens", () => {
    expect(render("{{ }}", baseCtx)).toBe("{{ }}");
  });
});
