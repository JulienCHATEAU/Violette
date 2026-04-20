import type { RecognitionSuggestion } from "@/lib/zod-schemas";
import { recognizeWithPlantId } from "./plant-id";
import { recognizeWithClaude } from "./claude-vision";

export type RecognitionResult = {
  suggestions: RecognitionSuggestion[];
  source: "plant-id" | "claude-vision" | "none";
};

/**
 * Cascade: Plant.id -> Claude Vision -> empty.
 * Always resolves (never throws) so the UI can gracefully fall back to manual entry.
 */
export async function recognize(imageBase64: string): Promise<RecognitionResult> {
  const fromPlantId = await recognizeWithPlantId(imageBase64);
  if (fromPlantId && fromPlantId.length) {
    // Enrich missing care data via Claude when key is present
    const enriched = await maybeEnrichWithClaude(imageBase64, fromPlantId);
    return { suggestions: enriched, source: "plant-id" };
  }

  const fromClaude = await recognizeWithClaude(imageBase64);
  if (fromClaude && fromClaude.length) {
    return { suggestions: fromClaude, source: "claude-vision" };
  }

  return { suggestions: [], source: "none" };
}

async function maybeEnrichWithClaude(
  imageBase64: string,
  suggestions: RecognitionSuggestion[],
): Promise<RecognitionSuggestion[]> {
  const top = suggestions[0];
  if (!top) return suggestions;
  const needsCare =
    top.wateringFrequencyDays === undefined ||
    top.sunlightExposure === undefined ||
    top.humidity === undefined;
  if (!needsCare) return suggestions;

  const claude = await recognizeWithClaude(imageBase64);
  if (!claude || !claude.length) return suggestions;
  const match = claude.find((c) => c.species && c.species === top.species) ?? claude[0];
  if (!match) return suggestions;
  return [
    {
      ...top,
      wateringFrequencyDays: top.wateringFrequencyDays ?? match.wateringFrequencyDays,
      sunlightExposure: top.sunlightExposure ?? match.sunlightExposure,
      humidity: top.humidity ?? match.humidity,
      temperatureRange: top.temperatureRange ?? match.temperatureRange,
      description: top.description ?? match.description,
    },
    ...suggestions.slice(1),
  ];
}
