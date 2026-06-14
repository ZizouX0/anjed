"use client";

import { BlobImage } from "./BlobImage";
import type { Item } from "@/lib/types";

export function ItemCard({
  item,
  selected,
  onClick,
  showSource = true,
}: {
  item: Item;
  selected?: boolean;
  onClick?: () => void;
  showSource?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`card card--interactive item-card${selected ? " item-card--selected" : ""}`}
      aria-pressed={selected}
    >
      <BlobImage blob={item.image} alt={item.name ?? "vêtement"} className="thumb" />
      {showSource && (
        <span
          className={`badge ${item.source === "perso" ? "badge--perso" : "badge--web"}`}
        >
          {item.source === "perso" ? "À moi" : "Web"}
        </span>
      )}
      {item.name ? <span className="item-card__name">{item.name}</span> : null}
    </button>
  );
}
