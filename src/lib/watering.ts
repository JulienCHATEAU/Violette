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

export function statusLabel(s: WateringStatus): string {
  switch (s) {
    case "overdue":
      return "En retard";
    case "due":
      return "À arroser aujourd'hui";
    case "soon":
      return "Demain";
    case "ok":
      return "OK";
  }
}

export function statusColor(s: WateringStatus): string {
  switch (s) {
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200";
    case "due":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "soon":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "ok":
      return "bg-leaf-100 text-leaf-700 border-leaf-200";
  }
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
