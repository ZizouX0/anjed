"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Barre d'écran réutilisable : bouton « retour » (‹) + titre + bouton « accueil » (⌂).
 * Donne une navigation claire et cohérente sur chaque sous-écran
 * (comme les apps closets : on sait toujours revenir en arrière ou au menu).
 */
export function ScreenHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  /** Remplace le bouton « accueil » à droite (ex. une action propre à l'écran). */
  action?: ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="app-header app-header--nav">
      <div className="app-header__bar">
        <button
          type="button"
          className="icon-btn"
          onClick={() => router.back()}
          aria-label="Revenir en arrière"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="app-header__title">{title}</h1>
        {action ?? (
          <Link href="/" className="icon-btn" aria-label="Revenir au menu">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 11.4 12 4l9 7.4" />
              <path d="M5.5 10.2V20h13v-9.8" />
            </svg>
          </Link>
        )}
      </div>
      {subtitle ? <p className="app-header__sub muted-text">{subtitle}</p> : null}
    </header>
  );
}
