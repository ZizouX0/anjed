"use client";

import { ScreenHeader } from "@/components/ScreenHeader";

import { useEffect, useState } from "react";
import { ImagePicker } from "@/components/ImagePicker";
import { BlobImage } from "@/components/BlobImage";
import { clearProfile, getProfile, setProfile, wipeAll } from "@/lib/db";
import { getApiKey, setApiKey } from "@/lib/apikey";

export default function ReglagesPage() {
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [key, setKey] = useState("");
  const [savedKey, setSavedKey] = useState(false);

  useEffect(() => {
    getProfile().then((p) => setPhoto(p?.photo ?? null)).catch(() => {});
    setKey(getApiKey());
  }, []);

  return (
    <div className="screen stack">
      <ScreenHeader title="Réglages" />

      <section className="card stack">
        <h2>Clé IA</h2>
        <p className="muted-text">
          Colle ta clé Google Gemini (gratuite) pour activer l&rsquo;essayage, la styliste et
          l&rsquo;amélioration des photos. Elle reste <strong>sur ton téléphone</strong>.{" "}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
            En obtenir une
          </a>
          .
        </p>
        <label className="field">
          <span className="label">Clé Gemini</span>
          <input
            className="input"
            type="password"
            name="gemini-key"
            autoComplete="off"
            spellCheck={false}
            placeholder="AIza…"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setSavedKey(false);
            }}
          />
        </label>
        <div className="toolbar">
          <button
            className="btn btn--primary"
            onClick={() => {
              setApiKey(key);
              setSavedKey(true);
            }}
          >
            {savedKey ? "Clé enregistrée ✓" : "Enregistrer la clé"}
          </button>
          {key && (
            <button
              className="btn btn--ghost"
              onClick={() => {
                setKey("");
                setApiKey("");
                setSavedKey(false);
              }}
            >
              Effacer
            </button>
          )}
        </div>
      </section>

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
          Tes photos, ton dressing et ta clé restent <strong>sur ton téléphone</strong>. Lors
          d&rsquo;un essayage, ta photo et ta clé sont envoyées au service d&rsquo;IA de Google
          (Gemini) uniquement pour générer l&rsquo;image ; l&rsquo;application ne les conserve pas.
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
