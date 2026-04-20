import Anthropic from "@anthropic-ai/sdk";
import type { Plant } from "@prisma/client";

export type MessageKind = "watering_due" | "greeting";

export type GeneratedMessage = {
  title: string;
  body: string;
  source: "llm" | "template";
};

const WATERING_TEMPLATES = [
  "Coucou c'est {{nickname}} 🌿 j'ai un peu soif, tu passes me voir ?",
  "Psst… {{nickname}} qui murmure : la terre est sèche 🥺",
  "{{nickname}} en mode SOS 💧 — un petit verre ?",
  "Tes feuilles préférées ont soif ({{nickname}} insiste 😤)",
  "Hey {{owner}}, c'est {{nickname}}. Mes racines te disent bonjour et… zut, j'oubliais, l'eau 💦",
];

const GREETING_TEMPLATES = [
  "Hey ! {{nickname}} qui te fait un coucou depuis la fenêtre ☀️",
  "{{nickname}} photosynthétise et pense à toi 🌱",
  "Coucou humain préféré, c'est {{nickname}} 💚",
  "Petit bonjour de {{nickname}}, la lumière est top aujourd'hui ✨",
  "{{nickname}} ici — tout va bien de ton côté ? 🌿",
];

export async function generatePlantMessage(plant: Plant, kind: MessageKind): Promise<GeneratedMessage> {
  const nickname = plant.nickname || plant.name;
  const persona = nickname;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallback(plant, kind);

  const client = new Anthropic({ apiKey });

  const daysSinceWatered = Math.floor((Date.now() - plant.lastWateredAt.getTime()) / 86_400_000);
  const overdue = Math.max(0, daysSinceWatered - plant.wateringFrequencyDays);

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: `Tu écris des notifications push TRÈS COURTES (≤160 caractères) au nom d'une plante.
Ton : première personne, chaleureux, un brin taquin, parfois un emoji 🌿💧✨.
Pas de guillemets. Pas de préambule. Réponds STRICTEMENT en JSON : {"title":"...","body":"..."}.
"title" ≤ 40 caractères.
"body" ≤ 160 caractères, voix de la plante s'adressant à son humain.
Langue : français.`,
      messages: [
        {
          role: "user",
          content: buildPrompt(persona, plant, kind, overdue),
        },
      ],
    });

    const text = msg.content.find((c) => c.type === "text");
    if (text?.type === "text") {
      const parsed = safeJson(text.text);
      if (parsed?.title && parsed?.body) {
        return { title: trim(parsed.title, 60), body: trim(parsed.body, 180), source: "llm" };
      }
    }
  } catch (err) {
    console.warn("[generate-message] LLM fallback:", err);
  }
  return fallback(plant, kind);
}

function buildPrompt(persona: string, plant: Plant, kind: MessageKind, overdue: number): string {
  if (kind === "watering_due") {
    return `Plante "${persona}" (espèce: ${plant.species ?? "inconnue"}). Elle a soif, ${
      overdue > 0 ? `en retard de ${overdue} jour(s).` : `c'est le jour d'arroser.`
    } Écris sa notification.`;
  }
  return `Plante "${persona}" (espèce: ${plant.species ?? "inconnue"}). Elle veut juste dire bonjour, sans rien demander. Écris sa notification.`;
}

function fallback(plant: Plant, kind: MessageKind): GeneratedMessage {
  const nickname = plant.nickname || plant.name;
  const pool = kind === "watering_due" ? WATERING_TEMPLATES : GREETING_TEMPLATES;
  const pick = pool[Math.floor(Math.random() * pool.length)] ?? pool[0]!;
  const body = pick.replaceAll("{{nickname}}", nickname).replaceAll("{{owner}}", "toi");
  const title = kind === "watering_due" ? `${nickname} a soif 💧` : `${nickname} te dit coucou 🌿`;
  return { title, body, source: "template" };
}

function safeJson(s: string): { title?: string; body?: string } | null {
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start < 0 || end < 0) return null;
  try {
    return JSON.parse(s.slice(start, end + 1));
  } catch {
    return null;
  }
}

function trim(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}
