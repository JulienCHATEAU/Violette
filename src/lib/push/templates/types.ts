export type Tone =
  | "funny"
  | "dramatic"
  | "needy"
  | "zen"
  | "sassy"
  | "poetic"
  | "formal"
  | "worried";

export type PushContext =
  | "due"
  | "overdue_light"
  | "overdue_severe"
  | "greeting";

export type Template = {
  id: string;
  contexts: PushContext[];
  tones: Tone[];
  title: string;
  body: string;
};
