// Clé API Gemini fournie par l'utilisatrice (« BYOK »), stockée sur l'appareil.
const KEY = "anjed_gemini_key";

export function getApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function setApiKey(value: string): void {
  if (typeof window === "undefined") return;
  try {
    const v = value.trim();
    if (v) localStorage.setItem(KEY, v);
    else localStorage.removeItem(KEY);
  } catch {
    /* stockage indisponible */
  }
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}

// Jeton Hugging Face (optionnel) pour l'essayage IA : débloque un quota perso
// si le moteur gratuit est saturé. Stocké sur l'appareil, comme la clé Gemini.
const HF_KEY = "anjed_hf_token";

export function getHfToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(HF_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setHfToken(value: string): void {
  if (typeof window === "undefined") return;
  try {
    const v = value.trim();
    if (v) localStorage.setItem(HF_KEY, v);
    else localStorage.removeItem(HF_KEY);
  } catch {
    /* stockage indisponible */
  }
}
