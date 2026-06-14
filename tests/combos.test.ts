import { describe, it, expect } from "vitest";
import { suggestCombos, randomCombo } from "../lib/combos";
import type { Item, Category } from "../lib/types";

// ── helpers ──────────────────────────────────────────────────────────────────

let _id = 0;
function makeItem(
  category: Category,
  source: "perso" | "web",
  overrides: Partial<Item> = {},
): Item {
  return {
    id: `item-${++_id}`,
    category,
    source,
    image: new Blob(["x"], { type: "image/png" }),
    createdAt: Date.now(),
    ...overrides,
  };
}

// ── suggestCombos ─────────────────────────────────────────────────────────────

describe("suggestCombos — source filter", () => {
  it("ignores items with source === 'web'", () => {
    const items: Item[] = [
      makeItem("haut", "web"),
      makeItem("bas", "web"),
      makeItem("haut", "perso"),
      makeItem("bas", "perso"),
    ];
    const combos = suggestCombos(items, 100);
    // Only the perso haut+bas pair should exist — web items must not appear
    for (const combo of combos) {
      for (const item of combo) {
        expect(item.source).toBe("perso");
      }
    }
  });

  it("returns [] when every item is 'web'", () => {
    const items: Item[] = [
      makeItem("haut", "web"),
      makeItem("bas", "web"),
      makeItem("robe", "web"),
    ];
    expect(suggestCombos(items)).toEqual([]);
  });

  it("returns [] when there are no items at all", () => {
    expect(suggestCombos([])).toEqual([]);
  });
});

describe("suggestCombos — haut × bas pairing", () => {
  it("produces exactly H×B combos (no shoes)", () => {
    // 2 hauts × 3 bas = 6 combos expected
    const items: Item[] = [
      makeItem("haut", "perso"),
      makeItem("haut", "perso"),
      makeItem("bas", "perso"),
      makeItem("bas", "perso"),
      makeItem("bas", "perso"),
    ];
    const combos = suggestCombos(items, 100);
    expect(combos).toHaveLength(6);
  });

  it("every haut+bas combo contains exactly 2 items (no shoes available)", () => {
    const items: Item[] = [
      makeItem("haut", "perso"),
      makeItem("bas", "perso"),
    ];
    const combos = suggestCombos(items, 100);
    expect(combos).toHaveLength(1);
    expect(combos[0]).toHaveLength(2);
    expect(combos[0][0].category).toBe("haut");
    expect(combos[0][1].category).toBe("bas");
  });

  it("appends a chaussures to each haut+bas combo when shoes are present", () => {
    const items: Item[] = [
      makeItem("haut", "perso"),
      makeItem("bas", "perso"),
      makeItem("chaussures", "perso"),
    ];
    const combos = suggestCombos(items, 100);
    expect(combos).toHaveLength(1);
    expect(combos[0]).toHaveLength(3);
    expect(combos[0][2].category).toBe("chaussures");
  });

  it("the chaussures item added is always one of the perso shoes", () => {
    const shoe1 = makeItem("chaussures", "perso");
    const shoe2 = makeItem("chaussures", "perso");
    const items: Item[] = [
      makeItem("haut", "perso"),
      makeItem("bas", "perso"),
      shoe1,
      shoe2,
    ];
    // Run many times to catch randomness issues
    for (let i = 0; i < 50; i++) {
      const combos = suggestCombos(items, 100);
      for (const combo of combos) {
        if (combo.length === 3) {
          expect([shoe1.id, shoe2.id]).toContain(combo[2].id);
        }
      }
    }
  });

  it("produces 0 combos when there are hauts but no bas", () => {
    const items: Item[] = [
      makeItem("haut", "perso"),
      makeItem("haut", "perso"),
    ];
    expect(suggestCombos(items, 100)).toHaveLength(0);
  });

  it("produces 0 combos when there are bas but no hauts", () => {
    const items: Item[] = [
      makeItem("bas", "perso"),
      makeItem("bas", "perso"),
    ];
    expect(suggestCombos(items, 100)).toHaveLength(0);
  });
});

describe("suggestCombos — robe standalone combos", () => {
  it("each robe becomes a standalone combo (1 item, no shoes)", () => {
    const items: Item[] = [
      makeItem("robe", "perso"),
      makeItem("robe", "perso"),
    ];
    const combos = suggestCombos(items, 100);
    expect(combos).toHaveLength(2);
    for (const combo of combos) {
      expect(combo).toHaveLength(1);
      expect(combo[0].category).toBe("robe");
    }
  });

  it("robe combo gets a chaussures appended when shoes are present", () => {
    const items: Item[] = [
      makeItem("robe", "perso"),
      makeItem("chaussures", "perso"),
    ];
    const combos = suggestCombos(items, 100);
    expect(combos).toHaveLength(1);
    expect(combos[0]).toHaveLength(2);
    expect(combos[0][0].category).toBe("robe");
    expect(combos[0][1].category).toBe("chaussures");
  });

  it("robe combos and haut+bas combos coexist", () => {
    const items: Item[] = [
      makeItem("haut", "perso"),
      makeItem("bas", "perso"),
      makeItem("robe", "perso"),
    ];
    const combos = suggestCombos(items, 100);
    // 1 haut×bas + 1 robe = 2 total
    expect(combos).toHaveLength(2);
  });
});

describe("suggestCombos — max cap", () => {
  it("never returns more than max combos (default 6)", () => {
    // 3 hauts × 4 bas = 12 combos, should be capped at 6
    const items: Item[] = [
      makeItem("haut", "perso"),
      makeItem("haut", "perso"),
      makeItem("haut", "perso"),
      makeItem("bas", "perso"),
      makeItem("bas", "perso"),
      makeItem("bas", "perso"),
      makeItem("bas", "perso"),
    ];
    const combos = suggestCombos(items);
    expect(combos.length).toBeLessThanOrEqual(6);
  });

  it("respects a custom max value", () => {
    const items: Item[] = [
      makeItem("haut", "perso"),
      makeItem("haut", "perso"),
      makeItem("bas", "perso"),
      makeItem("bas", "perso"),
    ]; // 4 combos total
    expect(suggestCombos(items, 2)).toHaveLength(2);
    expect(suggestCombos(items, 3)).toHaveLength(3);
    expect(suggestCombos(items, 100)).toHaveLength(4);
  });

  it("returns all combos when total is below max", () => {
    const items: Item[] = [
      makeItem("haut", "perso"),
      makeItem("bas", "perso"),
    ]; // only 1 combo
    expect(suggestCombos(items, 6)).toHaveLength(1);
  });

  it("returns 0 combos when max === 0", () => {
    const items: Item[] = [
      makeItem("haut", "perso"),
      makeItem("bas", "perso"),
    ];
    expect(suggestCombos(items, 0)).toHaveLength(0);
  });
});

describe("suggestCombos — unrelated categories are ignored", () => {
  it("veste and accessoire items do not appear in combos", () => {
    const items: Item[] = [
      makeItem("haut", "perso"),
      makeItem("bas", "perso"),
      makeItem("veste", "perso"),
      makeItem("accessoire", "perso"),
    ];
    const combos = suggestCombos(items, 100);
    // 1 combo of [haut, bas] — veste/accessoire should not be in any combo
    expect(combos).toHaveLength(1);
    for (const combo of combos) {
      for (const item of combo) {
        expect(["haut", "bas", "chaussures", "robe"]).toContain(item.category);
      }
    }
  });
});

// ── randomCombo ───────────────────────────────────────────────────────────────

describe("randomCombo", () => {
  it("returns null when there are no usable perso items", () => {
    expect(randomCombo([])).toBeNull();
  });

  it("returns null when all items are 'web'", () => {
    const items: Item[] = [
      makeItem("haut", "web"),
      makeItem("bas", "web"),
    ];
    expect(randomCombo(items)).toBeNull();
  });

  it("returns null when perso items cannot form a combo (haut but no bas)", () => {
    const items: Item[] = [makeItem("haut", "perso")];
    expect(randomCombo(items)).toBeNull();
  });

  it("returns null when perso items cannot form a combo (bas but no haut, no robe)", () => {
    const items: Item[] = [makeItem("bas", "perso")];
    expect(randomCombo(items)).toBeNull();
  });

  it("returns a non-null array when a valid haut+bas pair exists", () => {
    const items: Item[] = [
      makeItem("haut", "perso"),
      makeItem("bas", "perso"),
    ];
    const result = randomCombo(items);
    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
    expect(result!.length).toBeGreaterThanOrEqual(1);
  });

  it("returns a non-null array when a robe exists", () => {
    const items: Item[] = [makeItem("robe", "perso")];
    const result = randomCombo(items);
    expect(result).not.toBeNull();
    expect(result![0].category).toBe("robe");
  });

  it("returned combo contains only perso items", () => {
    const items: Item[] = [
      makeItem("haut", "perso"),
      makeItem("bas", "perso"),
      makeItem("haut", "web"),
      makeItem("bas", "web"),
    ];
    for (let i = 0; i < 20; i++) {
      const result = randomCombo(items);
      expect(result).not.toBeNull();
      for (const item of result!) {
        expect(item.source).toBe("perso");
      }
    }
  });

  it("returned combo has at most 3 items", () => {
    const items: Item[] = [
      makeItem("haut", "perso"),
      makeItem("bas", "perso"),
      makeItem("chaussures", "perso"),
    ];
    const result = randomCombo(items);
    expect(result).not.toBeNull();
    expect(result!.length).toBeLessThanOrEqual(3);
  });
});
