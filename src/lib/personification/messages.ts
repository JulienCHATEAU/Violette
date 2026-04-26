import type { PersonificationMessage } from "./types";

/**
 * Catalogue of bubble messages by category.
 * Tone: warm, slightly playful, French. Plants speak in the first person.
 * Keep entries 35-90 chars so they fit comfortably in a `<PlantBubble size="md">`.
 */
export const MESSAGES: ReadonlyArray<PersonificationMessage> = [
  // greeting ────────────────────────────────────────────────
  { category: "greeting", text: "Coucou, ravie de te revoir." },
  { category: "greeting", text: "Hey ! J'allais bien jusque-là." },
  { category: "greeting", text: "Salut toi 🌿" },
  { category: "greeting", text: "Tu m'as manqué, juste un peu." },
  { category: "greeting", text: "Bonne journée à toi aussi." },
  { category: "greeting", text: "Je guettais ton retour." },

  // thirsty ──────────────────────────────────────────────────
  { category: "thirsty", text: "J'ai un peu soif…" },
  { category: "thirsty", text: "Mes feuilles tombent, tu vois bien." },
  { category: "thirsty", text: "Une petite gorgée, s'il te plaît ?" },
  { category: "thirsty", text: "L'arrosage, c'est pour bientôt ? 💧" },
  { category: "thirsty", text: "J'ai vraiment besoin d'eau là." },
  { category: "thirsty", text: "Au secours, je me dessèche." },
  { category: "thirsty", text: "Tu m'avais oubliée ?" },

  // watered_thanks ──────────────────────────────────────────
  { category: "watered_thanks", text: "Aaah, ça fait du bien, merci !" },
  { category: "watered_thanks", text: "Merci pour la douche 🌧" },
  { category: "watered_thanks", text: "Tu prends soin de moi, c'est doux." },
  { category: "watered_thanks", text: "Hydratée, comblée, merci." },
  { category: "watered_thanks", text: "Mes racines te remercient." },
  { category: "watered_thanks", text: "C'était parfait, merci !" },

  // long_time_no_see ────────────────────────────────────────
  { category: "long_time_no_see", text: "Ça fait un bail, dis donc." },
  { category: "long_time_no_see", text: "On ne se voit plus assez…" },
  { category: "long_time_no_see", text: "Je commençais à m'ennuyer." },
  { category: "long_time_no_see", text: "Tu reviens enfin ?" },
  { category: "long_time_no_see", text: "J'avais oublié à quoi tu ressemblais." },
  { category: "long_time_no_see", text: "Reviens plus souvent, OK ? 🌱" },

  // seasonal ────────────────────────────────────────────────
  { category: "seasonal", text: "Sens-tu le printemps qui arrive ?" },
  { category: "seasonal", text: "L'hiver est rude, je ralentis." },
  { category: "seasonal", text: "Belle lumière aujourd'hui, non ?" },
  { category: "seasonal", text: "Je préfère quand il fait doux." },
  { category: "seasonal", text: "L'air est sec en ce moment." },
  { category: "seasonal", text: "Je rêve d'un peu de pluie." },

  // general ─────────────────────────────────────────────────
  { category: "general", text: "Tout va bien chez moi." },
  { category: "general", text: "Je pousse tranquillement." },
  { category: "general", text: "Une nouvelle feuille arrive 🌿" },
  { category: "general", text: "Je profite de la lumière." },
  { category: "general", text: "Je te trouve bien attentive." },
  { category: "general", text: "Tout doux, tout calme." },
];
