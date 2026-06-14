import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";

interface WardrobeItem {
  id: string;
  category: string;
  name?: string;
  color?: string;
}
interface Body {
  message?: string;
  wardrobe?: WardrobeItem[];
  history?: { role: "me" | "ai"; text: string }[];
}

interface GeminiTextPart {
  text?: string;
}
interface GeminiTextResponse {
  candidates?: { content?: { parts?: GeminiTextPart[] } }[];
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Clé API manquante (GEMINI_API_KEY)." }, { status: 500 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const message = body.message?.trim();
  const wardrobe = body.wardrobe ?? [];
  const history = body.history ?? [];
  if (!message) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }

  const wardrobeList = wardrobe.length
    ? wardrobe
        .map(
          (w) =>
            `- id:${w.id} | ${w.category}${w.name ? ` | ${w.name}` : ""}${w.color ? ` | ${w.color}` : ""}`,
        )
        .join("\n")
    : "(garde-robe vide)";

  const system = [
    "Tu es la styliste personnelle d'Anjed : chaleureuse, bienveillante, encourageante et concise.",
    "Tu composes des tenues UNIQUEMENT à partir des vêtements de SA garde-robe ci-dessous (référencés par id).",
    "Réponds en français, 1 à 3 phrases, ton doux.",
    "Choisis des pièces cohérentes (un haut + un bas, ou une robe ; ajoute chaussures/veste/accessoire si utile).",
    'Réponds STRICTEMENT en JSON valide, sans aucun texte autour : {"message": "<ton conseil court>", "itemIds": ["<id>", ...]}',
    "itemIds doit contenir les id EXACTS des pièces choisies. Si rien ne convient, mets itemIds = [] et explique gentiment.",
    "",
    "Garde-robe d'Anjed :",
    wardrobeList,
  ].join("\n");

  const contents = [
    ...history.slice(-6).map((h) => ({
      role: h.role === "me" ? "user" : "model",
      parts: [{ text: h.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
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
            : "La styliste n'a pas pu répondre. Réessaie.",
      },
      { status },
    );
  }

  const data = (await res.json()) as GeminiTextResponse;
  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

  let parsed: { message?: string; itemIds?: string[] } = {};
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { message: text || "Hmm, je n'ai pas trouvé d'idée cette fois.", itemIds: [] };
  }

  const valid = new Set(wardrobe.map((w) => w.id));
  const itemIds = (parsed.itemIds ?? []).filter((id) => valid.has(id));
  return NextResponse.json({
    message: parsed.message ?? "Voici une idée ✨",
    itemIds,
  });
}
