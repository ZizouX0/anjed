"use client";

import { ScreenHeader } from "@/components/ScreenHeader";

import Link from "next/link";
import { MOODS } from "@/lib/types";
import { useApp } from "../providers";

export default function MoodPage() {
  const {
    mood,
    setMood,
    isPlaying,
    togglePlay,
    muted,
    toggleMute,
    volume,
    setVolume,
  } = useApp();
  const current = MOODS.find((m) => m.key === mood);

  return (
    <div className="screen stack">
      <ScreenHeader
        title="Ambiance"
        subtitle="Choisis ton mood — la musique et les couleurs s&rsquo;adaptent 🎧"
      />

      <div className="mood-selector">
        {MOODS.map((m) => (
          <button
            key={m.key}
            className={`mood-card${mood === m.key ? " mood-card--active" : ""}`}
            onClick={() => setMood(m.key)}
          >
            <span className="mood-card__emoji" aria-hidden>
              {m.emoji}
            </span>
            <span className="mood-card__name">{m.label}</span>
            <span className="mood-card__vibe muted-text">{m.vibe}</span>
          </button>
        ))}
      </div>

      <div className="player">
        <button
          className="player__btn"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Lecture"}
        >
          {isPlaying ? "⏸️" : "▶️"}
        </button>
        <div className="stack" style={{ flex: 1 }}>
          <strong>
            {current?.emoji} {current?.label}
          </strong>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label="Volume"
          />
        </div>
        <button
          className="player__btn"
          onClick={toggleMute}
          aria-label={muted ? "Activer le son" : "Couper le son"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <p className="muted-text center">
        Pas encore de musique ? Ajoute des fichiers libres de droits dans{" "}
        <code>public/music/</code> (cosy.mp3, romantic.mp3…).
      </p>
      <Link href="/reglages" className="btn btn--ghost btn--block">
        ⚙️ Réglages &amp; confidentialité
      </Link>
    </div>
  );
}
