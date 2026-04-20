import type { Template } from "./types";
import { WATERING_DUE_TEMPLATES } from "./watering-due";
import { WATERING_OVERDUE_TEMPLATES } from "./watering-overdue";
import { GREETING_TEMPLATES } from "./greeting";

export const ALL_TEMPLATES: Template[] = [
  ...WATERING_DUE_TEMPLATES,
  ...WATERING_OVERDUE_TEMPLATES,
  ...GREETING_TEMPLATES,
];

export { WATERING_DUE_TEMPLATES, WATERING_OVERDUE_TEMPLATES, GREETING_TEMPLATES };
export type { Template, PushContext, Tone } from "./types";
