// Télécharge les skills listés dans un skillslock.json vers .claude/skills/<slug>/SKILL.md
// Vérifie l'intégrité via le sha256 (computedHash) du lock.
// Lancer : node scripts/install-skills.mjs [chemin-du-lock]
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const lockPath = process.argv[2] || ".claude/skills.lock.json";
const lock = JSON.parse(readFileSync(lockPath, "utf8"));
const REFS = ["main", "master"];

function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const entries = Object.entries(lock.skills ?? {});
let ok = 0;
let mismatch = 0;
const failures = [];

for (const [name, meta] of entries) {
  const { source, skillPath, computedHash } = meta;
  let done = false;
  for (const ref of REFS) {
    const url = `https://raw.githubusercontent.com/${source}/${ref}/${skillPath}`;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const text = await res.text();
      const hash = createHash("sha256").update(text).digest("hex");
      const dir = `.claude/skills/${slug(name)}`;
      mkdirSync(dir, { recursive: true });
      writeFileSync(`${dir}/SKILL.md`, text);
      const good = hash === computedHash;
      if (good) ok++;
      else mismatch++;
      console.log(`${good ? "✓" : "≠"} ${name}  [${source} @ ${ref}]${good ? "" : "  (hash différent)"}`);
      done = true;
      break;
    } catch {
      /* essaie le ref suivant */
    }
  }
  if (!done) {
    failures.push(name);
    console.log(`✗ ${name}  — introuvable`);
  }
}

console.log(
  `\n${ok + mismatch}/${entries.length} skills téléchargés ` +
    `(${ok} vérifiés, ${mismatch} avec hash différent, ${failures.length} échecs).`,
);
if (failures.length) console.log("Échecs : " + failures.join(", "));
