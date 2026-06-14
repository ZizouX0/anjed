import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";

interface InlinePart {
  inline_data: { mime_type: string; data: string };
}
interface TextPart {
  text: string;
}
type Part = InlinePart | TextPart;

function toInlinePart(dataUrl: string): InlinePart {
  const m = /^data:(.+?);base64,(.*)$/s.exec(dataUrl);
  if (m) return { inline_data: { mime_type: m[1], data: m[2] } };
  return { inline_data: { mime_type: "image/jpeg", data: dataUrl } };
}

function defaultPrompt(count: number): string {
  return [
    "Tu es un outil d'essayage virtuel de vêtements.",
    "La PREMIÈRE image montre une personne.",
    count > 1
      ? "Les images SUIVANTES montrent des vêtements à lui faire porter ensemble, comme une tenue complète."
      : "L'image SUIVANTE montre un vêtement à lui faire porter.",
    "Génère une nouvelle image photoréaliste de CETTE MÊME personne portant ce(s) vêtement(s).",
    "Conserve fidèlement son visage, sa coiffure, sa carnation, sa morphologie, sa posture et l'arrière-plan.",
    "Ajuste les vêtements de façon réaliste : tombé du tissu, plis, ombres et proportions.",
    "Ne déforme pas le visage. Rends uniquement l'image finale.",
  ].join(" ");
}

interface GeminiPartOut {
  text?: string;
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

export async function POST(req: Request) {
  let body: { person?: string; garments?: string[]; prompt?: string; apiKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const key = (body.apiKey && body.apiKey.trim()) || process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Ajoute ta clé Gemini dans Réglages pour activer l'essayage ✨" },
      { status: 400 },
    );
  }

  const { person, garments, prompt } = body;
  if (!person || !Array.isArray(garments) || garments.length === 0) {
    return NextResponse.json(
      { error: "Une photo de toi et au moins un vêtement sont nécessaires." },
      { status: 400 },
    );
  }

  const parts: Part[] = [
    { text: prompt || defaultPrompt(garments.length) },
    toInlinePart(person),
    ...garments.map(toInlinePart),
  ];

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts }] }),
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Impossible de contacter le service d'IA. Vérifie ta connexion." },
      { status: 502 },
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const status = res.status === 429 ? 429 : 502;
    const msg =
      res.status === 429
        ? "Quota d'IA atteint pour le moment. Réessaie un peu plus tard."
        : "L'IA n'a pas pu générer l'image. Réessaie avec une autre photo.";
    return NextResponse.json({ error: msg, detail: detail.slice(0, 300) }, { status });
  }

  const data = (await res.json()) as GeminiResponse;
  const image = extractImage(data);
  if (!image) {
    return NextResponse.json(
      { error: "Aucune image renvoyée. Essaie une autre photo ou un autre vêtement." },
      { status: 502 },
    );
  }
  return NextResponse.json({ image });
}
