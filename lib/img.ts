// Utilitaires images : compression côté client + conversions.

/** Redimensionne/compresse une image (depuis la caméra ou la galerie). */
export async function fileToCompressedBlob(
  file: Blob,
  maxDim = 1280,
  quality = 0.85,
): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    return await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality),
    );
  } catch {
    return file;
  }
}

/** Blob -> data URL (base64) pour l'envoi à l'API. */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/** data URL (base64) -> Blob. */
export function dataURLToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(head)?.[1] ?? "image/png";
  const bin = atob(body);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
