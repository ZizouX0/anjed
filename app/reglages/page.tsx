"use client";

import { ScreenHeader } from "@/components/ScreenHeader";

import { useEffect, useState } from "react";
import { ImagePicker } from "@/components/ImagePicker";
import { BlobImage } from "@/components/BlobImage";
import { clearProfile, getProfile, setProfile, wipeAll } from "@/lib/db";
import { getApiKey, setApiKey, getHfToken, setHfToken } from "@/lib/apikey";

export default function ReglagesPage() {
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [key, setKey] = useState("");
  const [savedKey, setSavedKey] = useState(false);
  const [hf, setHf] = useState("");
  const [savedHf, setSavedHf] = useState(false);

  useEffect(() => {
    getProfile().then((p) => setPhoto(p?.photo ?? null)).catch(() => {});
    setKey(getApiKey());
    setHf(getHfToken());
  }, []);

  return (
    <div className="screen stack">
      <ScreenHeader title="Réglages" />

      <section className="card stack">
        <h2>Ta styliste (IA texte)</h2>
        <p className="muted-text">
          Colle ta clé Google Gemini (gratuite) pour discuter avec ta styliste.
          L&rsquo;<strong>essayage, lui, marche sans clé</strong> (moteur gratuit). La clé reste{" "}
          <strong>sur ton téléphone</strong>.{" "}
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
        <h2>Essayage (moteur gratuit)</h2>
        <p className="muted-text">
          L&rsquo;essayage IA est <strong>gratuit</strong> et ne demande aucune clé. S&rsquo;il
          affiche « moteur très demandé », tu peux coller un jeton{" "}
          <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer">
            Hugging Face
          </a>{" "}
          (gratuit, optionnel) pour avoir ton propre quota.
        </p>
        <label className="field">
          <span className="label">Jeton Hugging Face (optionnel)</span>
          <input
            className="input"
            type="password"
            name="hf-token"
            autoComplete="off"
            spellCheck={false}
            placeholder="hf_…"
            value={hf}
            onChange={(e) => {
              setHf(e.target.value);
              setSavedHf(false);
            }}
          />
        </label>
        <div className="toolbar">
          <button
            className="btn btn--primary"
            onClick={() => {
              setHfToken(hf);
              setSavedHf(true);
            }}
          >
            {savedHf ? "Jeton enregistré ✓" : "Enregistrer le jeton"}
          </button>
          {hf && (
            <button
              className="btn btn--ghost"
              onClick={() => {
                setHf("");
                setHfToken("");
                setSavedHf(false);
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
          Tes photos, ton dressing et tes clés restent <strong>sur ton téléphone</strong>. Pour la
          styliste, ton texte est envoyé à Google (Gemini). Pour l&rsquo;essayage, ta photo et le
          vêtement sont envoyés au moteur gratuit (Hugging Face) le temps de générer
          l&rsquo;image ; l&rsquo;application ne les conserve pas.
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
