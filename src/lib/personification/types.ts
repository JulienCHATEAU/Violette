export type PersonificationCategory =
  | "greeting"
  | "thirsty"
  | "watered_thanks"
  | "long_time_no_see"
  | "seasonal"
  | "general";

export type PersonificationMessage = {
  category: PersonificationCategory;
  text: string;
};

export type PersonificationInput = {
  id: string;
  lastWateredAt: Date | string;
  wateringFrequencyDays: number;
};
