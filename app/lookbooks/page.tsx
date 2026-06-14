"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LooksTabs } from "@/components/LooksTabs";
import { BlobImage } from "@/components/BlobImage";
import { getLooks } from "@/lib/db";
import { OCCASIONS, type Look } from "@/lib/types";

export default function LookbooksPage() {
  const [looks, setLooks] = useState<Look[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    getLooks().then(setLooks).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => reload(), [reload]);

  const planned = useMemo(
    () =>
      looks
        .filter((l) => l.plannedFor)
        .sort((a, b) => (a.plannedFor ?? 0) - (b.plannedFor ?? 0)),
    [looks],
  );
  const byOccasion = useMemo(
    () =>
      OCCASIONS.map((o) => ({
        o,
        list: looks.filter((l) => l.occasion === o.key),
      })).filter((g) => g.list.length > 0),
    [looks],
  );
  const untagged = useMemo(() => looks.filter((l) => !l.occasion), [looks]);

  return (
    <div className="screen stack">
      <header className="app-header">
        <h1 className="section-title">Lookbooks</h1>
      </header>
      <LooksTabs />

      {loading ? null : looks.length === 0 ? (
        <div className="empty-state">
          <p>Aucun look à organiser.</p>
          <p className="muted-text">Enregistre des essayages, puis range-les par occasion ✨</p>
        </div>
      ) : (
        <>
          <section className="lookbook-section">
            <h2 className="occasion-title">🗓️ Agenda</h2>
            {planned.length === 0 ? (
              <p className="agenda-empty muted-text">
                Aucune tenue planifiée. Ouvre un look (onglet Looks) pour choisir un jour.
              </p>
            ) : (
              planned.map((l) => (
                <div key={l.id} className="agenda-item">
                  <span className="agenda-date">
                    {new Date(l.plannedFor ?? 0).toLocaleDateString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <BlobImage blob={l.resultImage} alt="look" className="thumb" />
                </div>
              ))
            )}
          </section>

          {byOccasion.map(({ o, list }) => (
            <section key={o.key} className="lookbook-section">
              <h2 className="occasion-title">
                {o.emoji} {o.label}
              </h2>
              <div className="grid">
                {list.map((l) => (
                  <BlobImage
                    key={l.id}
                    blob={l.resultImage}
                    alt="look"
                    className="thumb item-card"
                  />
                ))}
              </div>
            </section>
          ))}

          {untagged.length > 0 && (
            <section className="lookbook-section">
              <h2 className="occasion-title">✨ À ranger</h2>
              <p className="muted-text">
                Ouvre un look dans l&rsquo;onglet Looks pour lui donner une occasion.
              </p>
              <div className="grid">
                {untagged.map((l) => (
                  <BlobImage
                    key={l.id}
                    blob={l.resultImage}
                    alt="look"
                    className="thumb item-card"
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
