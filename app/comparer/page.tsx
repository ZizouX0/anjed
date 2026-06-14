"use client";

import { ScreenHeader } from "@/components/ScreenHeader";

import { useCallback, useEffect, useState } from "react";
import { LooksTabs } from "@/components/LooksTabs";
import { BlobImage } from "@/components/BlobImage";
import { getLooks, updateLook } from "@/lib/db";
import type { Look } from "@/lib/types";

export default function ComparerPage() {
  const [looks, setLooks] = useState<Look[]>([]);
  const [sel, setSel] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    getLooks().then(setLooks).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => reload(), [reload]);

  const toggle = (id: string) =>
    setSel((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length >= 3 ? s : [...s, id],
    );

  const chosen = looks.filter((l) => sel.includes(l.id));

  async function pick(look: Look) {
    await updateLook({ ...look, favorite: true });
    reload();
  }

  return (
    <div className="screen stack">
      <ScreenHeader title="Comparer" />
      <LooksTabs />

      {loading ? null : looks.length < 2 ? (
        <div className="empty-state">
          <p>Il te faut au moins 2 looks enregistrés.</p>
          <p className="muted-text">Essaie des tenues et garde tes préférées ✨</p>
        </div>
      ) : (
        <>
          <p className="muted-text">Choisis 2 ou 3 looks, puis désigne ton préféré 👑</p>

          {chosen.length >= 2 && (
            <div className="compare-grid">
              {chosen.map((l) => (
                <div key={l.id} className="compare-cell">
                  <BlobImage blob={l.resultImage} alt="look" className="compare-cell__img" />
                  <button
                    type="button"
                    className={`compare-pick${l.favorite ? " compare-pick--chosen" : ""}`}
                    onClick={() => pick(l)}
                  >
                    {l.favorite ? "👑 Choisi" : "👑 Je choisis"}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid">
            {looks.map((l) => (
              <button
                key={l.id}
                type="button"
                className={`card card--interactive item-card${sel.includes(l.id) ? " item-card--selected" : ""}`}
                onClick={() => toggle(l.id)}
              >
                <BlobImage blob={l.resultImage} alt="look" className="thumb" />
                {l.favorite && <span className="badge">❤️</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
