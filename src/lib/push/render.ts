import type { Plant } from "@prisma/client";

const WATER_EMOJIS = ["💧", "💦", "🚰"];
const PLANT_EMOJIS = ["🌿", "🪴", "🌱", "☘️"];
const LOVE_EMOJIS = ["💚", "💜", "🌸"];
const SAD_EMOJIS = ["🥺", "😢", "😮‍💨", "😭"];

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

export type RenderContext = {
  nickname: string;
  name: string;
  species: string;
  daysOverdue: number;
  lastWateredDays: number;
  frequencyDays: number;
  timeOfDay: "matin" | "après-midi" | "soir";
  waterEmoji: string;
  plantEmoji: string;
  loveEmoji: string;
  sadEmoji: string;
};

export function buildRenderContext(plant: Plant, now: Date = new Date()): RenderContext {
  const lastWateredDays = Math.max(
    0,
    Math.floor((now.getTime() - plant.lastWateredAt.getTime()) / 86_400_000),
  );
  const daysOverdue = Math.max(0, lastWateredDays - plant.wateringFrequencyDays);

  const h = now.getHours();
  const timeOfDay: RenderContext["timeOfDay"] =
    h < 12 ? "matin" : h < 18 ? "après-midi" : "soir";

  return {
    nickname: plant.nickname || plant.name,
    name: plant.name,
    species: plant.species ?? "plante",
    daysOverdue,
    lastWateredDays,
    frequencyDays: plant.wateringFrequencyDays,
    timeOfDay,
    waterEmoji: pick(WATER_EMOJIS),
    plantEmoji: pick(PLANT_EMOJIS),
    loveEmoji: pick(LOVE_EMOJIS),
    sadEmoji: pick(SAD_EMOJIS),
  };
}

const FILTERS: Record<string, (v: unknown) => string> = {
  plural: (v) => (typeof v === "number" && v > 1 ? "s" : ""),
  lower: (v) => String(v).toLowerCase(),
  upper: (v) => String(v).toUpperCase(),
};

export function render(template: string, ctx: RenderContext): string {
  return template.replace(
    /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)(?:\s*:\s*([a-zA-Z_]+))?\s*\}\}/g,
    (_, key: string, filter: string | undefined) => {
      const val = (ctx as unknown as Record<string, unknown>)[key];
      if (val === undefined || val === null) return "";
      if (filter && FILTERS[filter]) return FILTERS[filter](val);
      return String(val);
    },
  );
}
