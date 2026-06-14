"use client";

import { useEffect, useState } from "react";
import { ImagePicker } from "@/components/ImagePicker";
import { BlobImage } from "@/components/BlobImage";
import { clearProfile, getProfile, setProfile, wipeAll } from "@/lib/db";

export default function ReglagesPage() {
  const [photo, setPhoto] = useState<Blob | null>(null);

  useEffect(() => {
    getProfile().then((p) => setPhoto(p?.photo ?? null)).catch(() => {});
  }, []);

  return (
    <div className="screen stack">
      <header className="app-header">
        <h1 className="section-title">Réglages</h1>
      </header>

      <section className="card stack">
        <h2>Ma photo</h2>
        {photo ? (
          <BlobImage blob={photo} alt="moi" className="person-photo" />
        ) : (
          <p className="muted-text">Aucune photo pour l&rsquo;instant.</p>
        )}
        <div className="toolbar">
          <ImagePicker
            capture="user"
            className="btn btn--primary"
            onPick={async (b) => {
              await setProfile(b);
              setPhoto(b);
            }}
          >
            🤳 Changer ma photo
          </ImagePicker>
          {photo && (
            <button
              className="btn btn--ghost"
              onClick={async () => {
                await clearProfile();
                setPhoto(null);
              }}
            >
              Supprimer
            </button>
          )}
        </div>
      </section>

      <section className="card stack">
        <h2>Confidentialité</h2>
        <p className="muted-text">
          Tes photos et ton dressing restent <strong>sur ton téléphone</strong>. Rien n&rsquo;est
          publié ni partagé sans toi. Au moment d&rsquo;un essayage, ta photo est envoyée au service
          d&rsquo;IA de Google (Gemini) uniquement pour générer l&rsquo;image, puis l&rsquo;application
          ne la conserve pas.
        </p>
      </section>

      <section className="card stack danger">
        <h2>Mes données</h2>
        <p className="muted-text">Efface tout (photos, dressing, looks) de cet appareil.</p>
        <button
          className="btn btn--ghost"
          onClick={async () => {
            if (confirm("Tout effacer ? Cette action est définitive.")) {
              await wipeAll();
              location.href = "/";
            }
          }}
        >
          🗑️ Tout effacer
        </button>
      </section>

      <p className="muted-text center">Anjed&rsquo;s Closet — v0.1 💛</p>
    </div>
  );
}
