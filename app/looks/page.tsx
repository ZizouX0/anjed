"use client";

import { useCallback, useEffect, useState } from "react";
import { BlobImage } from "@/components/BlobImage";
import { Modal } from "@/components/Modal";
import { LooksTabs } from "@/components/LooksTabs";
import { deleteLook, getLooks, updateLook } from "@/lib/db";
import { OCCASIONS, type Look } from "@/lib/types";

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
    getLooks().then(setLooks).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => reload(), [reload]);

  async function patch(next: Look) {
    await updateLook(next);
    setActive(next);
    reload();
  }

  return (
    <div className="screen stack">
      <header className="app-header">
        <h1 className="section-title">Mes looks</h1>
        <p className="muted-text">Ton historique d&rsquo;essayages 📸</p>
      </header>
      <LooksTabs />

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

            <div className="field">
              <span className="label">Occasion</span>
              <div className="toolbar">
                {OCCASIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    className={`chip${active.occasion === o.key ? " chip--active" : ""}`}
                    onClick={() =>
                      patch({
                        ...active,
                        occasion: active.occasion === o.key ? undefined : o.key,
                      })
                    }
                  >
                    {o.emoji} {o.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="field">
              <span className="label">Planifier ce look (agenda)</span>
              <input
                className="input"
                type="date"
                value={
                  active.plannedFor
                    ? new Date(active.plannedFor).toISOString().slice(0, 10)
                    : ""
                }
                onChange={(e) =>
                  patch({
                    ...active,
                    plannedFor: e.target.value
                      ? new Date(e.target.value).getTime()
                      : undefined,
                  })
                }
              />
            </label>

            <div className="toolbar center">
              <button
                className="btn btn--ghost"
                onClick={() => patch({ ...active, favorite: !active.favorite })}
              >
                {active.favorite ? "💔 Retirer" : "❤️ Favori"}
              </button>
              <button className="btn btn--ghost" onClick={() => shareLook(active)}>
                📤 Partager
              </button>
              <button
                className="btn btn--ghost"
                onClick={async () => {
                  if (!confirm("Supprimer ce look ?")) return;
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
