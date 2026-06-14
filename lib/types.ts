// Types partagés de l'application Anjed's Closet

export type Category =
  | "haut"
  | "bas"
  | "robe"
  | "chaussures"
  | "veste"
  | "accessoire";

export const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: "haut", label: "Haut", emoji: "👚" },
  { key: "bas", label: "Bas", emoji: "👖" },
  { key: "robe", label: "Robe", emoji: "👗" },
  { key: "chaussures", label: "Chaussures", emoji: "👠" },
  { key: "veste", label: "Veste", emoji: "🧥" },
  { key: "accessoire", label: "Accessoire", emoji: "👜" },
];

export type ItemSource = "perso" | "web";

export type MoodKey = "cosy" | "romantic" | "boss" | "glow" | "dreamy" | "fun";

export const MOODS: { key: MoodKey; label: string; emoji: string; vibe: string }[] = [
  { key: "cosy", label: "Cosy", emoji: "🌙", vibe: "douce & lo-fi" },
  { key: "romantic", label: "Romantique", emoji: "💗", vibe: "rêveuse & tendre" },
  { key: "boss", label: "Confiance", emoji: "👑", vibe: "affirmée & pop" },
  { key: "glow", label: "Glow", emoji: "✨", vibe: "énergique & lumineuse" },
  { key: "dreamy", label: "Rêveuse", emoji: "☁️", vibe: "éthérée & ambient" },
  { key: "fun", label: "Fun", emoji: "🪩", vibe: "ludique & Y2K" },
];

export const OCCASIONS = [
  { key: "quotidien", label: "Quotidien", emoji: "☀️" },
  { key: "travail", label: "Travail", emoji: "💼" },
  { key: "soiree", label: "Soirée", emoji: "🌙" },
  { key: "rdv", label: "Rendez-vous", emoji: "💗" },
  { key: "sport", label: "Sport", emoji: "🤸‍♀️" },
  { key: "special", label: "Spécial", emoji: "✨" },
] as const;

export type OccasionKey = (typeof OCCASIONS)[number]["key"];

/** Photo de référence de l'utilisatrice (le « mannequin »). */
export interface Profile {
  id: string;
  name?: string;
  photo: Blob;
  createdAt: number;
}

/** Un vêtement, qu'il vienne du dressing perso ou du web. */
export interface Item {
  id: string;
  name?: string;
  category: Category;
  colorTag?: string;
  source: ItemSource;
  image: Blob;
  sourceUrl?: string;
  favorite?: boolean;
  createdAt: number;
}

/** Un essayage enregistré (entrée d'historique). */
export interface Look {
  id: string;
  resultImage: Blob;
  itemIds: string[];
  mood?: MoodKey;
  favorite?: boolean;
  occasion?: OccasionKey;
  plannedFor?: number; // timestamp du jour planifié (agenda)
  createdAt: number;
}

/** Préférences globales. */
export interface Settings {
  id: "app"; // singleton
  mood: MoodKey;
  volume: number; // 0..1
  muted: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  id: "app",
  mood: "romantic",
  volume: 0.5,
  muted: false,
};
