import type { RecognitionSuggestion } from "@/lib/zod-schemas";

/**
 * Plant.id v3 identification.
 * Docs: https://github.com/flowerchecker/Plant-id-API/wiki/Plant.id-API
 * Returns up to 3 suggestions or null if unavailable / not recognized.
 */
export async function recognizeWithPlantId(imageBase64: string): Promise<RecognitionSuggestion[] | null> {
  const apiKey = process.env.PLANT_ID_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://plant.id/api/v3/identification", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Api-Key": apiKey },
      body: JSON.stringify({
        images: [imageBase64],
        classification_level: "species",
        similar_images: false,
      }),
      // Safety: don't wait forever
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      console.warn("[plant-id] HTTP", res.status);
      return null;
    }

    const data = (await res.json()) as {
      result?: {
        classification?: {
          suggestions?: Array<{
            name?: string;
            probability?: number;
            details?: { common_names?: string[]; description?: { value?: string } };
          }>;
        };
      };
    };

    const suggestions = data.result?.classification?.suggestions ?? [];
    if (!suggestions.length) return null;

    return suggestions.slice(0, 3).map((s) => ({
      name: s.details?.common_names?.[0] ?? s.name ?? "Plante inconnue",
      species: s.name,
      description: s.details?.description?.value,
      confidence: s.probability,
      // Plant.id ne fournit pas directement ces champs — on laisse au LLM/manuel
      wateringFrequencyDays: undefined,
      sunlightExposure: undefined,
      humidity: undefined,
    }));
  } catch (err) {
    console.warn("[plant-id] error", err);
    return null;
  }
}
