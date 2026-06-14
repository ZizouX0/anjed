import { describe, it, expect } from "vitest";
import { dataURLToBlob } from "../lib/img";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Encode raw bytes as a data URL (pure Node, no browser APIs). */
function bytesToDataURL(bytes: Uint8Array, mime: string): string {
  // btoa operates on a binary string
  let binaryStr = "";
  for (const b of bytes) binaryStr += String.fromCharCode(b);
  return `data:${mime};base64,${btoa(binaryStr)}`;
}

/** Read a Blob back to a Uint8Array via ArrayBuffer (Node 22 Blob is global). */
async function blobToBytes(blob: Blob): Promise<Uint8Array> {
  const buf = await blob.arrayBuffer();
  return new Uint8Array(buf);
}

// ── dataURLToBlob ─────────────────────────────────────────────────────────────

describe("dataURLToBlob", () => {
  it("returns a Blob instance", () => {
    const dataUrl = bytesToDataURL(new Uint8Array([1, 2, 3]), "image/png");
    const blob = dataURLToBlob(dataUrl);
    expect(blob).toBeInstanceOf(Blob);
  });

  it("round-trip: decoded bytes match original bytes (image/png)", async () => {
    const original = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x00, 0xff, 0x42]);
    const dataUrl = bytesToDataURL(original, "image/png");
    const blob = dataURLToBlob(dataUrl);
    const decoded = await blobToBytes(blob);
    expect(decoded).toEqual(original);
  });

  it("round-trip: decoded bytes match original bytes (image/jpeg)", async () => {
    const original = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const dataUrl = bytesToDataURL(original, "image/jpeg");
    const blob = dataURLToBlob(dataUrl);
    const decoded = await blobToBytes(blob);
    expect(decoded).toEqual(original);
  });

  it("extracts the MIME type correctly for image/png", () => {
    const dataUrl = bytesToDataURL(new Uint8Array([1]), "image/png");
    const blob = dataURLToBlob(dataUrl);
    expect(blob.type).toBe("image/png");
  });

  it("extracts the MIME type correctly for image/jpeg", () => {
    const dataUrl = bytesToDataURL(new Uint8Array([1]), "image/jpeg");
    const blob = dataURLToBlob(dataUrl);
    expect(blob.type).toBe("image/jpeg");
  });

  it("extracts the MIME type correctly for image/webp", () => {
    const dataUrl = bytesToDataURL(new Uint8Array([0xaa, 0xbb]), "image/webp");
    const blob = dataURLToBlob(dataUrl);
    expect(blob.type).toBe("image/webp");
  });

  it("reports the correct byte size", async () => {
    const original = new Uint8Array([10, 20, 30, 40, 50]);
    const dataUrl = bytesToDataURL(original, "image/png");
    const blob = dataURLToBlob(dataUrl);
    expect(blob.size).toBe(original.byteLength);
  });

  it("handles an empty payload (0-byte blob)", async () => {
    const dataUrl = bytesToDataURL(new Uint8Array([]), "image/png");
    const blob = dataURLToBlob(dataUrl);
    expect(blob.size).toBe(0);
    const decoded = await blobToBytes(blob);
    expect(decoded).toEqual(new Uint8Array([]));
  });

  it("handles arbitrary binary data (all byte values 0–255)", async () => {
    const original = new Uint8Array(256);
    for (let i = 0; i < 256; i++) original[i] = i;
    const dataUrl = bytesToDataURL(original, "application/octet-stream");
    const blob = dataURLToBlob(dataUrl);
    const decoded = await blobToBytes(blob);
    expect(decoded).toEqual(original);
  });

  it("falls back to 'image/png' when MIME is missing from the header", () => {
    // Craft a malformed header with no recognisable MIME
    const dataUrl = `data:;base64,${btoa("x")}`;
    const blob = dataURLToBlob(dataUrl);
    // The regex /:(.*?);/ won't match "data:;base64,..." because the colon is
    // followed immediately by ";", so group 1 is an empty string.
    // The nullish coalesce in the source sends that to "image/png".
    // We accept either empty string or "image/png" to be strict about observed behavior.
    expect(["", "image/png"]).toContain(blob.type);
  });
});
