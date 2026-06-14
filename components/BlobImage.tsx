"use client";

import { useEffect, useState } from "react";

/** Affiche un Blob (image stockée localement) via un object URL révoqué proprement. */
export function BlobImage({
  blob,
  alt = "",
  className,
}: {
  blob: Blob | null | undefined;
  alt?: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);

  if (!url) return <div className={`shimmer ${className ?? ""}`} aria-hidden />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={className} />;
}
