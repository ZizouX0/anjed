import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const UA =
  "Mozilla/5.0 (compatible; AnjedsCloset/0.1; virtual try-on importer)";

function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".local")) return true;
  if (h === "0.0.0.0" || h === "::1") return true;
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h)) return true;
  if (/^169\.254\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  return false;
}

function absolutize(src: string, base: string): string | null {
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
}

function extractImageUrl(html: string, base: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = re.exec(html);
    if (m?.[1]) {
      const u = absolutize(m[1], base);
      if (u) return u;
    }
  }
  const img = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
  if (img?.[1]) return absolutize(img[1], base);
  return null;
}

async function toDataUrl(res: Response, fallbackMime = "image/jpeg"): Promise<string> {
  const buf = Buffer.from(await res.arrayBuffer());
  const mime = (res.headers.get("content-type") || fallbackMime).split(";")[0];
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Lien manquant." }, { status: 400 });

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: "Lien invalide." }, { status: 400 });
  }
  if (!/^https?:$/.test(target.protocol) || isPrivateHost(target.hostname)) {
    return NextResponse.json({ error: "Lien non autorisé." }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(target.toString(), {
      headers: { "User-Agent": UA, Accept: "text/html,image/*,*/*" },
      redirect: "follow",
    });
  } catch {
    return NextResponse.json({ error: "Impossible d'ouvrir ce lien." }, { status: 502 });
  }
  if (!res.ok) {
    return NextResponse.json({ error: "Lien inaccessible." }, { status: 502 });
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.startsWith("image/")) {
    const image = await toDataUrl(res);
    return NextResponse.json({ image, sourceUrl: target.toString() });
  }

  const html = await res.text();
  const imgUrl = extractImageUrl(html, target.toString());
  if (!imgUrl) {
    return NextResponse.json(
      { error: "Aucune image trouvée sur cette page. Importe plutôt une capture d'écran." },
      { status: 404 },
    );
  }

  let imgRes: Response;
  try {
    imgRes = await fetch(imgUrl, {
      headers: { "User-Agent": UA, Accept: "image/*,*/*" },
      redirect: "follow",
    });
  } catch {
    return NextResponse.json({ error: "Image introuvable." }, { status: 502 });
  }
  if (!imgRes.ok) {
    return NextResponse.json({ error: "Image introuvable." }, { status: 502 });
  }
  const image = await toDataUrl(imgRes);
  return NextResponse.json({ image, sourceUrl: target.toString() });
}
