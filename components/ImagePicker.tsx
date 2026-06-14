"use client";

import { useRef, useState } from "react";
import { fileToCompressedBlob } from "@/lib/img";

/**
 * Bouton qui ouvre la caméra ou la galerie et renvoie une image compressée.
 * `capture` : "user" (selfie) | "environment" (photo) | undefined (galerie).
 */
export function ImagePicker({
  onPick,
  capture,
  accept = "image/*",
  className,
  children,
}: {
  onPick: (blob: Blob) => void | Promise<void>;
  capture?: "user" | "environment";
  accept?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        disabled={busy}
        onClick={() => ref.current?.click()}
      >
        {children}
      </button>
      <input
        ref={ref}
        type="file"
        accept={accept}
        capture={capture}
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy(true);
          try {
            const blob = await fileToCompressedBlob(f);
            await onPick(blob);
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );
}
