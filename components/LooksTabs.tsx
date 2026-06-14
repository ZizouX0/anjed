"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/looks", label: "📸 Looks" },
  { href: "/lookbooks", label: "📔 Lookbooks" },
  { href: "/comparer", label: "🤔 Comparer" },
];

export function LooksTabs() {
  const path = usePathname();
  return (
    <div className="tabs">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`tab${path === t.href ? " tab--active" : ""}`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
