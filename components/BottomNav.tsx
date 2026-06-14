"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; icon: string; cta?: boolean };

// Barre principale, inspirée des apps closets (Acloset/Whering) :
// Accueil · Dressing · ✨ Essayer (central) · Styliste · Looks.
const ITEMS: NavItem[] = [
  { href: "/", label: "Accueil", icon: "🏠" },
  { href: "/dressing", label: "Dressing", icon: "👗" },
  { href: "/essayer", label: "Essayer", icon: "✨", cta: true },
  { href: "/styliste", label: "Styliste", icon: "💬" },
  { href: "/looks", label: "Looks", icon: "📸" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {ITEMS.map((it) => {
        const active =
          it.href === "/"
            ? path === "/"
            : path === it.href || path.startsWith(`${it.href}/`);
        if (it.cta) {
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`bottom-nav__cta${active ? " bottom-nav__cta--active" : ""}`}
              aria-label={it.label}
              aria-current={active ? "page" : undefined}
            >
              <span className="bottom-nav__icon" aria-hidden>
                {it.icon}
              </span>
            </Link>
          );
        }
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`bottom-nav__item${active ? " bottom-nav__item--active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="bottom-nav__icon" aria-hidden>
              {it.icon}
            </span>
            <span className="bottom-nav__label">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
