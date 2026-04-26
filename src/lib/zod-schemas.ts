import { z } from "zod";

export const SunlightExposure = z.enum(["full_sun", "partial_shade", "shade", "indirect_light"]);
export type SunlightExposure = z.infer<typeof SunlightExposure>;

export const HumidityLevel = z.enum(["low", "medium", "high"]);
export type HumidityLevel = z.infer<typeof HumidityLevel>;

export const PlantCreateInput = z.object({
  name: z.string().min(1).max(120),
  nickname: z.string().max(60).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  species: z.string().max(160).optional().nullable(),
  wateringFrequencyDays: z.number().int().min(1).max(365).default(7),
  lastWateredAt: z.coerce.date().optional(),
  sunlightExposure: SunlightExposure.default("indirect_light"),
  humidity: HumidityLevel.default("medium"),
  temperature: z.number().int().min(0).max(50).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});
export type PlantCreateInput = z.infer<typeof PlantCreateInput>;

export const PlantUpdateInput = PlantCreateInput.partial();
export type PlantUpdateInput = z.infer<typeof PlantUpdateInput>;

export const PushSubscribeInput = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
  }),
  userAgent: z.string().optional(),
  prefs: z
    .object({
      wateringRemindersEnabled: z.boolean().optional(),
      greetingsEnabled: z.boolean().optional(),
      greetingsPerDay: z.number().int().min(0).max(10).optional(),
      quietHoursStart: z.number().int().min(0).max(23).optional().nullable(),
      quietHoursEnd: z.number().int().min(0).max(23).optional().nullable(),
    })
    .optional(),
});
