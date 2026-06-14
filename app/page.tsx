"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfile, getItems } from "@/lib/db";
import { MOODS } from "@/lib/types";
import { useApp } from "./providers";

export default function Home() {
  const { mood } = useApp();
  const [hasPhoto, setHasPhoto] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    getProfile().then((p) => setHasPhoto(!!p)).catch(() => {});
    getItems("perso").then((i) => setItemCount(i.length)).catch(() => {});
  }, []);

  const moodInfo = MOODS.find((m) => m.key === mood);

  return (
    <div className="screen home">
      <header className="home__hero gradient-hero">
        <Link href="/reglages" className="home__settings" aria-label="Réglages">
          ⚙️
        </Link>
        <p className="home__hi">Bonjour Anjed</p>
        <h1 className="home__title">Anjed&rsquo;s Closet</h1>
        <p className="home__sub">Essaie tes tenues comme par magie ✨</p>
      </header>

      <section className="home__steps">
        <Link
          href="/essayer"
          className={`card card--interactive step${hasPhoto ? " step--done" : ""}`}
        >
          <span className="step__icon" aria-hidden>
            🤳
          </span>
          <span className="step__body">
            <span className="step__title">Ajoute ta photo</span>
            <span className="step__sub">Pour t&rsquo;essayer les tenues sur toi</span>
          </span>
        </Link>

        <Link
          href="/dressing"
          className={`card card--interactive step${itemCount > 0 ? " step--done" : ""}`}
        >
          <span className="step__icon" aria-hidden>
            📸
          </span>
          <span className="step__body">
            <span className="step__title">Ajoute un vêtement</span>
            <span className="step__sub">
              {itemCount > 0
                ? `${itemCount} pièce${itemCount > 1 ? "s" : ""} dans ton dressing`
                : "Photographie une pièce de ta garde-robe"}
            </span>
          </span>
        </Link>

        <Link href="/essayer" className="card card--interactive step">
          <span className="step__icon" aria-hidden>
            ✨
          </span>
          <span className="step__body">
            <span className="step__title">Essaie un look</span>
            <span className="step__sub">Vois le résultat en quelques secondes</span>
          </span>
        </Link>
      </section>

      <section className="stack">
        <Link href="/essayer" className="btn btn--primary btn--lg btn--block">
          ✨ Essayer un look
        </Link>
        <Link href="/mood" className="btn btn--ghost btn--block">
          {moodInfo ? `${moodInfo.emoji} Ambiance : ${moodInfo.label}` : "🎧 Choisir une ambiance"}
        </Link>
        <Link href="/reglages" className="btn btn--ghost btn--block">
          ⚙️ Réglages &amp; confidentialité
        </Link>
      </section>
    </div>
  );
}
