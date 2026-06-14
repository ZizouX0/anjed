// Couche de stockage local (IndexedDB) — tout reste sur l'appareil.
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import {
  type Profile,
  type Item,
  type Look,
  type Settings,
  type ItemSource,
  DEFAULT_SETTINGS,
} from "./types";

const DB_NAME = "anjeds-closet";
const DB_VERSION = 1;

interface ClosetDB extends DBSchema {
  profile: { key: string; value: Profile };
  items: {
    key: string;
    value: Item;
    indexes: { "by-source": string; "by-category": string };
  };
  looks: { key: string; value: Look; indexes: { "by-date": number } };
  settings: { key: string; value: Settings };
}

let dbPromise: Promise<IDBPDatabase<ClosetDB>> | null = null;

function getDB(): Promise<IDBPDatabase<ClosetDB>> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB indisponible côté serveur"));
  }
  if (!dbPromise) {
    dbPromise = openDB<ClosetDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("profile")) {
          db.createObjectStore("profile", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("items")) {
          const s = db.createObjectStore("items", { keyPath: "id" });
          s.createIndex("by-source", "source");
          s.createIndex("by-category", "category");
        }
        if (!db.objectStoreNames.contains("looks")) {
          const s = db.createObjectStore("looks", { keyPath: "id" });
          s.createIndex("by-date", "createdAt");
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ----- Items -----
export async function addItem(
  data: Omit<Item, "id" | "createdAt">,
): Promise<Item> {
  const item: Item = { ...data, id: uid(), createdAt: Date.now() };
  const db = await getDB();
  await db.put("items", item);
  return item;
}

export async function getItems(source?: ItemSource): Promise<Item[]> {
  const db = await getDB();
  const all = await db.getAll("items");
  const filtered = source ? all.filter((i) => i.source === source) : all;
  return filtered.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getItem(id: string): Promise<Item | undefined> {
  const db = await getDB();
  return db.get("items", id);
}

export async function getItemsByIds(ids: string[]): Promise<Item[]> {
  const db = await getDB();
  const out: Item[] = [];
  for (const id of ids) {
    const it = await db.get("items", id);
    if (it) out.push(it);
  }
  return out;
}

export async function updateItem(item: Item): Promise<void> {
  const db = await getDB();
  await db.put("items", item);
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("items", id);
}

// ----- Looks (historique) -----
export async function addLook(
  data: Omit<Look, "id" | "createdAt">,
): Promise<Look> {
  const look: Look = { ...data, id: uid(), createdAt: Date.now() };
  const db = await getDB();
  await db.put("looks", look);
  return look;
}

export async function getLooks(): Promise<Look[]> {
  const db = await getDB();
  const all = await db.getAll("looks");
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateLook(look: Look): Promise<void> {
  const db = await getDB();
  await db.put("looks", look);
}

export async function deleteLook(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("looks", id);
}

// ----- Profile -----
const PROFILE_ID = "me";

export async function getProfile(): Promise<Profile | undefined> {
  const db = await getDB();
  return db.get("profile", PROFILE_ID);
}

export async function setProfile(photo: Blob, name?: string): Promise<Profile> {
  const profile: Profile = {
    id: PROFILE_ID,
    photo,
    name,
    createdAt: Date.now(),
  };
  const db = await getDB();
  await db.put("profile", profile);
  return profile;
}

export async function clearProfile(): Promise<void> {
  const db = await getDB();
  await db.delete("profile", PROFILE_ID);
}

// ----- Settings -----
export async function getSettings(): Promise<Settings> {
  const db = await getDB();
  const s = await db.get("settings", "app");
  return s ?? DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  await db.put("settings", settings);
}

// ----- Maintenance -----
export async function wipeAll(): Promise<void> {
  const db = await getDB();
  await Promise.all([
    db.clear("items"),
    db.clear("looks"),
    db.clear("profile"),
    db.clear("settings"),
  ]);
}
