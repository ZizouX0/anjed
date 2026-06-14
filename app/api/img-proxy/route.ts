import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Petit proxy d'image : le moteur d'essayage (Hugging Face) renvoie une URL
 * sans en-tête CORS, donc le navigateur ne peut pas en lire les octets.
 * On récupère l'image côté serveur (pas de CORS) pour pouvoir l'afficher,
 * l'enregistrer et l'enchaîner. Limité aux domaines *.hf.space (anti-SSRF).
 */
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "URL manquante." }, { status: 400 });
  }
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "URL invalide." }, { status: 400 });
  }
  if (target.protocol !== "https:" || !target.hostname.endsWith(".hf.space")) {
    return NextResponse.json({ error: "Domaine non autorisé." }, { status: 403 });
  }

  let res: Response;
  try {
    res = await fetch(target.toString());
  } catch {
    return NextResponse.json({ error: "Image injoignable." }, { status: 502 });
  }
  if (!res.ok) {
    return NextResponse.json({ error: `Amont ${res.status}.` }, { status: 502 });
  }

  const buf = await res.arrayBuffer();
  const type = res.headers.get("content-type") || "image/png";
  return new NextResponse(buf, {
    headers: { "Content-Type": type, "Cache-Control": "no-store" },
  });
}
