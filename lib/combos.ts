// Suggestions de tenues (combos) à partir du dressing perso — règles simples (niveau 1).
import type { Item } from "./types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[]): T | undefined {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;
}

/** Génère des associations cohérentes à partir des vêtements possédés. */
export function suggestCombos(items: Item[], max = 6): Item[][] {
  const perso = items.filter((i) => i.source === "perso");
  const hauts = perso.filter((i) => i.category === "haut");
  const bas = perso.filter((i) => i.category === "bas");
  const robes = perso.filter((i) => i.category === "robe");
  const chaussures = perso.filter((i) => i.category === "chaussures");

  const combos: Item[][] = [];
  for (const h of hauts) {
    for (const b of bas) {
      const c = [h, b];
      const sh = pick(chaussures);
      if (sh) c.push(sh);
      combos.push(c);
    }
  }
  for (const r of robes) {
    const c = [r];
    const sh = pick(chaussures);
    if (sh) c.push(sh);
    combos.push(c);
  }
  return shuffle(combos).slice(0, max);
}

/** Une tenue aléatoire cohérente (« Surprends-moi »). */
export function randomCombo(items: Item[]): Item[] | null {
  return suggestCombos(items, 1)[0] ?? null;
}
