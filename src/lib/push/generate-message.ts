import type { Plant } from "@prisma/client";
import { ALL_TEMPLATES } from "./templates";
import type { PushContext, Tone } from "./templates/types";
import { selectTemplate } from "./select";
import { buildRenderContext, render } from "./render";
import { classifyWatering } from "./context";

export type MessageKind = "watering_due" | "greeting";

export type GeneratedMessage = {
  title: string;
  body: string;
  templateId: string;
};

export type GenerateOptions = {
  recentIds?: readonly string[];
  tones?: readonly Tone[];
  now?: Date;
};

export function generatePlantMessage(
  plant: Plant,
  kind: MessageKind,
  options: GenerateOptions = {},
): GeneratedMessage | null {
  const now = options.now ?? new Date();
  const context: PushContext | null =
    kind === "greeting" ? "greeting" : classifyWatering(plant, now);
  if (!context) return null;

  const template = selectTemplate(ALL_TEMPLATES, {
    context,
    recentIds: options.recentIds,
    tones: options.tones,
  });
  if (!template) return null;

  const ctx = buildRenderContext(plant, now);
  return {
    title: render(template.title, ctx),
    body: render(template.body, ctx),
    templateId: template.id,
  };
}
