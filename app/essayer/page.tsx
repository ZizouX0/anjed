"use client";

import { ScreenHeader } from "@/components/ScreenHeader";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ImagePicker } from "@/components/ImagePicker";
import { BlobImage } from "@/components/BlobImage";
import { ItemCard } from "@/components/ItemCard";
import { Modal } from "@/components/Modal";
import {
  addLook,
  getItems,
  getProfile,
  setProfile,
} from "@/lib/db";
import { blobToDataURL, dataURLToBlob } from "@/lib/img";
import { getHfToken } from "@/lib/apikey";
import { randomCombo } from "@/lib/combos";
import type { Item } from "@/lib/types";
import { useApp } from "../providers";

// Message d'erreur compréhensible (le moteur gratuit peut être saturé).
function tryonError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/quota|gpu|exceeded|rate|limit|busy|full/i.test(msg))
    return "Le moteur gratuit est très demandé là, tout de suite 😅 Réessaie dans une minute — ou ajoute un jeton Hugging Face gratuit dans Réglages pour avoir ton propre quota.";
  if (/connect|network|fetch|load|timeout|cors/i.test(msg))
    return "Connexion au moteur d'essayage impossible. Vérifie ta connexion et réessaie.";
  return "L'essayage n'a pas pu se faire cette fois. Réessaie dans un instant ✨";
}

function EssayerInner() {
  const { mood } = useApp();
  const params = useSearchParams();

  const [person, setPerson] = useState<Blob | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile().then((p) => setPerson(p?.photo ?? null)).catch(() => {});
    getItems().then(setItems).catch(() => {});
  }, []);

  useEffect(() => {
    const single = params.get("item");
    const multi = params.get("items");
    const ids = [
      ...(single ? [single] : []),
      ...(multi ? multi.split(",").filter(Boolean) : []),
    ];
    if (ids.length) setSelected((s) => Array.from(new Set([...s, ...ids])));
  }, [params]);

  const perso = useMemo(() => items.filter((i) => i.source === "perso"), [items]);
  const web = useMemo(() => items.filter((i) => i.source === "web"), [items]);
  const selectedItems = useMemo(
    () => items.filter((i) => selected.includes(i.id)),
    [items, selected],
  );

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  async function setMyPhoto(blob: Blob) {
    await setProfile(blob);
    setPerson(blob);
  }

  async function generate() {
    if (!person || selectedItems.length === 0) return;
    setGenerating(true);
    setError(null);
    setResult(null);
    setSaved(false);
    try {
      // Essayage virtuel via un moteur gratuit et open-source (IDM-VTON),
      // appelé directement depuis le navigateur — aucune clé requise.
      const { Client } = await import("@gradio/client");
      const token = getHfToken();
      const app = await Client.connect(
        "yisol/IDM-VTON",
        token ? { token: token as `hf_${string}` } : undefined,
      );
      // On applique les vêtements l'un après l'autre : le résultat de l'un
      // devient la « photo » pour le suivant (superposition haut + bas, etc.).
      let current: Blob = person;
      for (const it of selectedItems) {
        const out = await app.predict("/tryon", [
          { background: current, layers: [], composite: null },
          it.image,
          it.name || "a clothing item",
          true, // masquage automatique
          false, // recadrage automatique
          25, // étapes de génération
          Math.floor(Math.random() * 100000), // seed
        ]);
        const first = (out.data as unknown[])[0] as { url?: string } | string;
        const url = typeof first === "string" ? first : first?.url;
        if (!url) throw new Error("no-image");
        // Le résultat HF n'a pas d'en-tête CORS : on passe par notre proxy.
        const proxied = `/api/img-proxy?url=${encodeURIComponent(url)}`;
        current = await (await fetch(proxied)).blob();
      }
      setResult(await blobToDataURL(current));
    } catch (e) {
      setError(tryonError(e));
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!result) return;
    await addLook({
      resultImage: dataURLToBlob(result),
      itemIds: selected,
      mood,
    });
    setSaved(true);
  }

  async function share() {
    if (!result) return;
    try {
      const blob = dataURLToBlob(result);
      const file = new File([blob], "look.jpg", { type: blob.type });
      const nav = navigator as Navigator & {
        canShare?: (d?: ShareData) => boolean;
      };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Mon look", text: "Mon look ✨" });
      } else {
        const a = document.createElement("a");
        a.href = result;
        a.download = "look.jpg";
        a.click();
      }
    } catch {
      /* annulé */
    }
  }

  function surprise() {
    const combo = randomCombo(perso);
    if (combo) setSelected(combo.map((i) => i.id));
  }

  return (
    <div className="screen stack">
      <ScreenHeader title="Essayer" />

      {/* Photo de la personne */}
      {person ? (
        <section className="tryon__person card">
          <BlobImage blob={person} alt="toi" className="person-thumb" />
          <div className="stack">
            <strong>Ta photo</strong>
            <ImagePicker capture="user" className="btn btn--ghost" onPick={setMyPhoto}>
              Changer
            </ImagePicker>
          </div>
        </section>
      ) : (
        <section className="empty-state card">
          <p>Ajoute une photo de toi pour commencer ✨</p>
          <div className="toolbar center">
            <ImagePicker capture="user" className="btn btn--primary" onPick={setMyPhoto}>
              🤳 Selfie
            </ImagePicker>
            <ImagePicker className="btn btn--ghost" onPick={setMyPhoto}>
              🖼️ Galerie
            </ImagePicker>
          </div>
          <p className="muted-text">
            Astuce : une photo en pied, bien éclairée, donne le plus beau résultat.
          </p>
        </section>
      )}

      {/* Composition de la tenue */}
      <section className="stack">
        <div className="row">
          <h2 className="section-title" style={{ margin: 0 }}>
            Compose ta tenue
          </h2>
          <span className="spacer" />
          {perso.length > 0 && (
            <button className="btn btn--ghost" onClick={surprise}>
              🎲 Surprends-moi
            </button>
          )}
        </div>

        {selectedItems.length > 0 && (
          <div className="selected-strip">
            {selectedItems.map((i) => (
              <BlobImage
                key={i.id}
                blob={i.image}
                alt=""
                className="selected-strip__img"
              />
            ))}
          </div>
        )}

        {perso.length > 0 && (
          <>
            <h3 className="muted-text">👗 Mes vêtements</h3>
            <div className="grid">
              {perso.map((i) => (
                <ItemCard
                  key={i.id}
                  item={i}
                  showSource={false}
                  selected={selected.includes(i.id)}
                  onClick={() => toggle(i.id)}
                />
              ))}
            </div>
          </>
        )}

        {web.length > 0 && (
          <>
            <h3 className="muted-text">🔎 À tester (web)</h3>
            <div className="grid">
              {web.map((i) => (
                <ItemCard
                  key={i.id}
                  item={i}
                  selected={selected.includes(i.id)}
                  onClick={() => toggle(i.id)}
                />
              ))}
            </div>
          </>
        )}

        {perso.length === 0 && web.length === 0 && (
          <div className="empty-state">
            <p>Ajoute des vêtements à essayer.</p>
          </div>
        )}
      </section>

      <button
        className="btn btn--primary btn--lg btn--block"
        disabled={!person || selectedItems.length === 0 || generating}
        onClick={generate}
      >
        {generating ? "Essayage en cours…" : "✨ Essayer la tenue"}
      </button>
      {error && <p className="error-text center">{error}</p>}

      {generating && (
        <div className="loading-veil">
          <div className="spinner" />
          <p>On prépare ton look… ✨</p>
        </div>
      )}

      <Modal open={!!result} onClose={() => setResult(null)}>
        {result && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result} alt="ton look" className="result__img" />
            <div className="toolbar center">
              <button className="btn btn--primary" onClick={save} disabled={saved}>
                {saved ? "Enregistré ✓" : "💾 Enregistrer"}
              </button>
              <button className="btn btn--ghost" onClick={share}>
                📤 Partager
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => {
                  setResult(null);
                  generate();
                }}
              >
                🔄 Refaire
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default function EssayerPage() {
  return (
    <Suspense
      fallback={
        <div className="screen center">
          <div className="spinner" />
        </div>
      }
    >
      <EssayerInner />
    </Suspense>
  );
}
