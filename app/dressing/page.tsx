"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ImagePicker } from "@/components/ImagePicker";
import { ItemDraftEditor } from "@/components/ItemDraftEditor";
import { ItemCard } from "@/components/ItemCard";
import { Modal } from "@/components/Modal";
import { BlobImage } from "@/components/BlobImage";
import { addItem, deleteItem, getItems } from "@/lib/db";
import { CATEGORIES, type Category, type Item } from "@/lib/types";

export default function DressingPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState<Blob | null>(null);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [active, setActive] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    getItems("perso")
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => reload(), [reload]);

  const shown = filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="screen stack">
      <header className="app-header">
        <h1 className="section-title">Mon dressing</h1>
        <p className="muted-text">Tes vêtements à toi 💛</p>
      </header>

      {draft ? (
        <ItemDraftEditor
          blob={draft}
          onSave={async (category, name, image) => {
            await addItem({
              source: "perso",
              image,
              category,
              name: name || undefined,
            });
            setDraft(null);
            reload();
          }}
          onCancel={() => setDraft(null)}
        />
      ) : (
        <div className="toolbar">
          <ImagePicker capture="environment" className="btn btn--primary" onPick={setDraft}>
            📸 Prendre en photo
          </ImagePicker>
          <ImagePicker className="btn btn--ghost" onPick={setDraft}>
            🖼️ Galerie
          </ImagePicker>
        </div>
      )}

      {items.length > 0 && (
        <div className="toolbar">
          <button
            className={`chip${filter === "all" ? " chip--active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Tout
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`chip${filter === c.key ? " chip--active" : ""}`}
              onClick={() => setFilter(c.key)}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      )}

      {loading ? null : shown.length === 0 ? (
        <div className="empty-state">
          <p>Ton dressing est vide pour l&rsquo;instant.</p>
          <p className="muted-text">Photographie une première pièce ✨</p>
        </div>
      ) : (
        <div className="grid">
          {shown.map((it) => (
            <ItemCard
              key={it.id}
              item={it}
              showSource={false}
              onClick={() => setActive(it)}
            />
          ))}
        </div>
      )}

      <Modal open={!!active} onClose={() => setActive(null)}>
        {active && (
          <>
            <BlobImage blob={active.image} alt={active.name ?? "vêtement"} className="result__img" />
            {active.name && <strong className="center">{active.name}</strong>}
            <div className="toolbar center">
              <Link href={`/essayer?item=${active.id}`} className="btn btn--primary">
                ✨ Essayer
              </Link>
              <button
                className="btn btn--ghost"
                onClick={async () => {
                  if (!confirm("Supprimer cette pièce ?")) return;
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
