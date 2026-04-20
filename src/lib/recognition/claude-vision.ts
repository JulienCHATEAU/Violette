import Anthropic from "@anthropic-ai/sdk";
import { RecognitionSuggestion } from "@/lib/zod-schemas";

const SYSTEM_PROMPT = `Tu es un botaniste expert. L'utilisateur t'envoie une photo de plante d'intérieur ou de jardin.
Identifie la plante et propose jusqu'à 3 suggestions classées par probabilité.
Réponds STRICTEMENT en JSON valide avec ce schéma (aucun texte autour) :
{
  "suggestions": [
    {
      "name": "nom commun en français",
      "species": "nom scientifique latin",
      "description": "1-2 phrases descriptives en français",
      "wateringFrequencyDays": entier (jours entre arrosages),
      "sunlightExposure": "full_sun" | "partial_shade" | "shade" | "indirect_light",
      "humidity": "low" | "medium" | "high",
      "temperatureRange": "ex: 18-25°C",
      "confidence": nombre entre 0 et 1
    }
  ]
}
Si tu ne reconnais pas : { "suggestions": [] }.`;

export async function recognizeWithClaude(imageBase64: string): Promise<RecognitionSuggestion[] | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const client = new Anthropic({ apiKey });

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: detectMediaType(imageBase64),
                data: stripDataUrl(imageBase64),
              },
            },
            { type: "text", text: "Identifie cette plante." },
          ],
        },
      ],
    });

    const text = msg.content.find((c) => c.type === "text");
    if (!text || text.type !== "text") return null;

    const parsed = safeParseJson(text.text);
    if (!parsed || !Array.isArray(parsed.suggestions)) return null;

    const valid: RecognitionSuggestion[] = [];
    for (const s of parsed.suggestions) {
      const r = RecognitionSuggestion.safeParse(s);
      if (r.success) valid.push(r.data);
    }
    return valid.length ? valid : null;
  } catch (err) {
    console.warn("[claude-vision] error", err);
    return null;
  }
}

function stripDataUrl(b64: string): string {
  const comma = b64.indexOf(",");
  return comma > 0 && b64.startsWith("data:") ? b64.slice(comma + 1) : b64;
}

function detectMediaType(b64: string): "image/jpeg" | "image/png" | "image/webp" | "image/gif" {
  if (b64.startsWith("data:image/png")) return "image/png";
  if (b64.startsWith("data:image/webp")) return "image/webp";
  if (b64.startsWith("data:image/gif")) return "image/gif";
  return "image/jpeg";
}

function safeParseJson(s: string): { suggestions?: unknown[] } | null {
  const firstBrace = s.indexOf("{");
  const lastBrace = s.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace < 0) return null;
  try {
    return JSON.parse(s.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
}
