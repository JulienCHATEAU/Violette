export type WateringStatus = "overdue" | "due" | "soon" | "ok";

export function computeWatering(last: Date, freqDays: number, now: Date = new Date()) {
  const next = new Date(last.getTime() + freqDays * 86_400_000);
  const diffDays = Math.round((next.getTime() - now.getTime()) / 86_400_000);
  let status: WateringStatus;
  if (diffDays < 0) status = "overdue";
  else if (diffDays === 0) status = "due";
  else if (diffDays === 1) status = "soon";
  else status = "ok";
  return { next, diffDays, status };
}

export const SUNLIGHT_LABEL: Record<string, string> = {
  full_sun: "Plein soleil",
  partial_shade: "Mi-ombre",
  shade: "Ombre",
  indirect_light: "Lumière indirecte",
};

export const HUMIDITY_LABEL: Record<string, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Élevée",
};
