// Génère les icônes PWA (cœur dégradé) sans aucune dépendance externe.
// Lancer : node scripts/gen-icons.mjs
import zlib from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // profondeur 8 bits
  ihdr[9] = 6; // RGBA
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filtre 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

function drawIcon(size, heartScale = 0.62) {
  const top = [244, 184, 198]; // #f4b8c6 rose poudré
  const bot = [199, 160, 201]; // #c7a0c9 mauve tendre
  const rgba = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) {
    const ty = py / (size - 1);
    const r = lerp(top[0], bot[0], ty);
    const g = lerp(top[1], bot[1], ty);
    const b = lerp(top[2], bot[2], ty);
    for (let px = 0; px < size; px++) {
      const x = ((px / (size - 1)) * 2 - 1) / heartScale;
      const y = (1 - (py / (size - 1)) * 2) / heartScale + 0.25;
      const f = Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y;
      const idx = (py * size + px) * 4;
      if (f <= 0) {
        rgba[idx] = 255;
        rgba[idx + 1] = 255;
        rgba[idx + 2] = 255;
        rgba[idx + 3] = 255;
      } else {
        rgba[idx] = r;
        rgba[idx + 1] = g;
        rgba[idx + 2] = b;
        rgba[idx + 3] = 255;
      }
    }
  }
  return rgba;
}

function write(path, size, heartScale) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, encodePNG(size, size, drawIcon(size, heartScale)));
  console.log("écrit", path, `${size}x${size}`);
}

const dir = "public/icons";
write(`${dir}/icon-192.png`, 192, 0.62);
write(`${dir}/icon-512.png`, 512, 0.62);
write(`${dir}/icon-512-maskable.png`, 512, 0.5);
write(`${dir}/apple-touch-icon.png`, 180, 0.62);
