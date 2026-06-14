"use client";

import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal__card" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
