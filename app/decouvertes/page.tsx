"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ImagePicker } from "@/components/ImagePicker";
import { ItemDraftEditor } from "@/components/ItemDraftEditor";
import { ItemCard } from "@/components/ItemCard";
import { Modal } from "@/components/Modal";
import { BlobImage } from "@/components/BlobImage";
import { addItem, deleteItem, getItems } from "@/lib/db";
import { dataURLToBlob } from "@/lib/img";
import type { Item } from "@/lib/types";

export default function DecouvertesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState<Blob | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | undefined>(undefined);
  const [url, setUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    getItems("web")
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => reload(), [reload]);

  async function importUrl() {
    if (!url.trim()) return;
    setImporting(true);
    setError(null);
    try {
      const r = await fetch(`/api/fetch-garment?url=${encodeURIComponent(url.trim())}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Import impossible");
      setDraft(dataURLToBlob(data.image));
      setSourceUrl(data.sourceUrl || url.trim());
      setUrl("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import impossible");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="screen stack">
      <header className="app-header">
        <h1 className="section-title">Découvertes</h1>
        <p className="muted-text">Des articles repérés en ligne, à tester avant d&rsquo;acheter 🔎</p>
      </header>

      {draft ? (
        <ItemDraftEditor
          blob={draft}
          onSave={async (category, name, image) => {
            await addItem({
              source: "web",
              image,
              category,
              name: name || undefined,
              sourceUrl,
            });
            setDraft(null);
            setSourceUrl(undefined);
            reload();
          }}
          onCancel={() => {
            setDraft(null);
            setSourceUrl(undefined);
          }}
        />
      ) : (
        <div className="card stack">
          <label className="field">
            <span className="label">Coller le lien d&rsquo;un article</span>
            <input
              className="input"
              type="url"
              name="garment-url"
              autoComplete="off"
              spellCheck={false}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              inputMode="url"
            />
          </label>
          <div className="toolbar">
            <button
              className="btn btn--primary"
              onClick={importUrl}
              disabled={importing || !url.trim()}
            >
              {importing ? "Import…" : "🔗 Importer le lien"}
            </button>
            <ImagePicker className="btn btn--ghost" onPick={setDraft}>
              🖼️ Importer une capture
            </ImagePicker>
          </div>
          {error && <p className="error-text">{error}</p>}
          <p className="muted-text">
            Astuce : le plus simple est de faire une <strong>capture d&rsquo;écran</strong> du vêtement
            et de l&rsquo;importer.
          </p>
        </div>
      )}

      {loading ? null : items.length === 0 ? (
        <div className="empty-state">
          <p>Aucune découverte pour l&rsquo;instant.</p>
          <p className="muted-text">Ajoute un article repéré en ligne ✨</p>
        </div>
      ) : (
        <div className="grid">
          {items.map((it) => (
            <ItemCard key={it.id} item={it} onClick={() => setActive(it)} />
          ))}
        </div>
      )}

      <Modal open={!!active} onClose={() => setActive(null)}>
        {active && (
          <>
            <BlobImage blob={active.image} alt={active.name ?? "article"} className="result__img" />
            {active.name && <strong className="center">{active.name}</strong>}
            <div className="toolbar center">
              <Link href={`/essayer?item=${active.id}`} className="btn btn--primary">
                ✨ Essayer
              </Link>
              {active.sourceUrl && (
                <a
                  className="btn btn--ghost"
                  href={active.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  🔗 Voir le produit
                </a>
              )}
              <button
                className="btn btn--ghost"
                onClick={async () => {
                  if (!confirm("Supprimer cet article ?")) return;
                  await deleteItem(active.id);
                  setActive(null);
                  reload();
                }}
              >
                🗑️ Supprimer
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
