"use client";

import { useState } from "react";
import { BlobImage } from "./BlobImage";
import { CATEGORIES, type Category } from "@/lib/types";
import { blobToDataURL, dataURLToBlob } from "@/lib/img";

/** Panneau d'ajout : aperçu + amélioration IA optionnelle + catégorie + nom. */
export function ItemDraftEditor({
  blob,
  onSave,
  onCancel,
}: {
  blob: Blob;
  onSave: (category: Category, name: string, image: Blob) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [current, setCurrent] = useState<Blob>(blob);
  const [category, setCategory] = useState<Category>("haut");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enhance() {
    setEnhancing(true);
    setError(null);
    try {
      const dataUrl = await blobToDataURL(current);
      const r = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Amélioration impossible");
      setCurrent(dataURLToBlob(data.image));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Amélioration impossible");
    } finally {
      setEnhancing(false);
    }
  }

  return (
    <div className="card draft">
      <BlobImage blob={current} alt="aperçu" className="draft__preview" />

      <button
        type="button"
        className="btn btn--ghost btn--block"
        onClick={enhance}
        disabled={enhancing}
      >
        {enhancing ? "Amélioration en cours…" : "✨ Améliorer la photo"}
      </button>
      {error && <p className="error-text">{error}</p>}

      <div className="field">
        <span className="label">Catégorie</span>
        <div className="toolbar">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`chip${category === c.key ? " chip--active" : ""}`}
              onClick={() => setCategory(c.key)}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      <label className="field">
        <span className="label">Nom (optionnel)</span>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex. Top blanc"
        />
      </label>

      <div className="toolbar">
        <button
          type="button"
          className="btn btn--primary"
          disabled={saving || enhancing}
          onClick={async () => {
            setSaving(true);
            await onSave(category, name.trim(), current);
            setSaving(false);
          }}
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={saving}>
          Annuler
        </button>
      </div>
    </div>
  );
}
