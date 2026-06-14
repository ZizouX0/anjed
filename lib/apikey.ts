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
