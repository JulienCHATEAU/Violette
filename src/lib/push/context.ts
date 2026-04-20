import type { Plant } from "@prisma/client";
import type { PushContext } from "./templates/types";

/**
 * Returns the watering-related context for a plant, or null if it's not yet
 * time to water (no notification expected).
 */
export function classifyWatering(plant: Plant, now: Date = new Date()): PushContext | null {
  const daysSince = Math.floor((now.getTime() - plant.lastWateredAt.getTime()) / 86_400_000);
  const overdue = daysSince - plant.wateringFrequencyDays;
  if (overdue < 0) return null;
  if (overdue === 0) return "due";
  if (overdue <= 2) return "overdue_light";
  return "overdue_severe";
}
