"use client";

import { useCallback, useEffect, useState } from "react";
import { BlobImage } from "@/components/BlobImage";
import { Modal } from "@/components/Modal";
import { deleteLook, getLooks, updateLook } from "@/lib/db";
import type { Look } from "@/lib/types";

async function shareLook(look: Look) {
  try {
    const file = new File([look.resultImage], "look.jpg", {
      type: look.resultImage.type || "image/jpeg",
    });
    const nav = navigator as Navigator & { canShare?: (d?: ShareData) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Mon look", text: "Mon look ✨" });
    } else {
      const url = URL.createObjectURL(look.resultImage);
      const a = document.createElement("a");
      a.href = url;
      a.download = "look.jpg";
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch {
    /* annulé */
  }
}

export default function LooksPage() {
  const [looks, setLooks] = useState<Look[]>([]);
  const [active, setActive] = useState<Look | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    getLooks()
      .then(setLooks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => reload(), [reload]);

  return (
    <div className="screen stack">
      <header className="app-header">
        <h1 className="section-title">Mes looks</h1>
        <p className="muted-text">Ton historique d&rsquo;essayages 📸</p>
      </header>

      {loading ? null : looks.length === 0 ? (
        <div className="empty-state">
          <p>Aucun look pour l&rsquo;instant.</p>
          <p className="muted-text">Essaie une tenue et enregistre-la ✨</p>
        </div>
      ) : (
        <div className="grid">
          {looks.map((l) => (
            <button
              key={l.id}
              className="card card--interactive item-card"
              onClick={() => setActive(l)}
            >
              <BlobImage blob={l.resultImage} alt="look" className="thumb" />
              {l.favorite && <span className="badge">❤️</span>}
            </button>
          ))}
        </div>
      )}

      <Modal open={!!active} onClose={() => setActive(null)}>
        {active && (
          <>
            <BlobImage blob={active.resultImage} alt="look" className="result__img" />
            <div className="toolbar center">
              <button
                className="btn btn--ghost"
                onClick={async () => {
                  const next = { ...active, favorite: !active.favorite };
                  await updateLook(next);
                  setActive(next);
                  reload();
                }}
              >
                {active.favorite ? "💔 Retirer" : "❤️ Favori"}
              </button>
              <button className="btn btn--ghost" onClick={() => shareLook(active)}>
                📤 Partager
              </button>
              <button
                className="btn btn--ghost"
                onClick={async () => {
                  await deleteLook(active.id);
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
