import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 45;

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";

interface InlinePart {
  inline_data: { mime_type: string; data: string };
}

function toInlinePart(dataUrl: string): InlinePart {
  const m = /^data:(.+?);base64,(.*)$/s.exec(dataUrl);
  if (m) return { inline_data: { mime_type: m[1], data: m[2] } };
  return { inline_data: { mime_type: "image/jpeg", data: dataUrl } };
}

interface GeminiPartOut {
  inline_data?: { mime_type?: string; data?: string };
  inlineData?: { mimeType?: string; data?: string };
}
interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPartOut[] } }[];
}

function extractImage(data: GeminiResponse): string | null {
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    const inline = p.inline_data ?? p.inlineData;
    if (inline?.data) {
      const mime = p.inline_data?.mime_type ?? p.inlineData?.mimeType ?? "image/png";
      return `data:${mime};base64,${inline.data}`;
    }
  }
  return null;
}

const PROMPT = [
  "Voici la photo d'un vêtement.",
  "Détoure-le proprement et présente-le seul, bien éclairé et centré, sur un fond neutre clair et uni, comme une belle photo catalogue.",
  "Conserve fidèlement la couleur, la matière, les motifs et les détails du vêtement.",
  "Rends uniquement l'image finale.",
].join(" ");

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Clé API manquante (GEMINI_API_KEY)." }, { status: 500 });
  }

  let body: { image?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  if (!body.image) {
    return NextResponse.json({ error: "Image manquante." }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: PROMPT }, toInlinePart(body.image)] }],
        }),
      },
    );
  } catch {
    return NextResponse.json({ error: "Service IA injoignable." }, { status: 502 });
  }

  if (!res.ok) {
    const status = res.status === 429 ? 429 : 502;
    return NextResponse.json(
      {
        error:
          status === 429
            ? "Quota IA atteint pour le moment. Réessaie bientôt."
            : "Impossible d'améliorer la photo. Réessaie.",
      },
      { status },
    );
  }

  const data = (await res.json()) as GeminiResponse;
  const image = extractImage(data);
  if (!image) {
    return NextResponse.json({ error: "Aucune image renvoyée. Réessaie." }, { status: 502 });
  }
  return NextResponse.json({ image });
}
