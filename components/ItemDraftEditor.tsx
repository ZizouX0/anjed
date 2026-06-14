"use client";

import { useState } from "react";
import { BlobImage } from "./BlobImage";
import { CATEGORIES, type Category } from "@/lib/types";

/** Panneau d'ajout : aperçu + choix de catégorie + nom optionnel. */
export function ItemDraftEditor({
  blob,
  onSave,
  onCancel,
}: {
  blob: Blob;
  onSave: (category: Category, name: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [category, setCategory] = useState<Category>("haut");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  return (
    <div className="card draft">
      <BlobImage blob={blob} alt="aperçu" className="draft__preview" />

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
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onSave(category, name.trim());
            setSaving(false);
          }}
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onCancel}
          disabled={saving}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
