// scripts/imagegen.js
// Headless kép-generátor OpenAI-val
// Futás: node scripts/imagegen.js jobs/bg.yaml  (vagy npm run imagegen -- jobs/bg.yaml)

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import yaml from "js-yaml";
import dotenv from "dotenv";

// __dirname kompatibilitás ESM-ben
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kifejezetten a tools/image-generator/.env.local betöltése
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true });
}

function stamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

async function saveFromUrl(url, outPath) {
  // Node 18+ esetén a fetch globálisan elérhető
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.promises.writeFile(outPath, buf);
}

async function saveFromB64(b64, outPath) {
  const buf = Buffer.from(b64, "base64");
  await fs.promises.writeFile(outPath, buf);
}

async function main() {
  const jobFile = process.argv[2];
  if (!jobFile) {
    console.error("Usage: node scripts/imagegen.js <job.yaml>");
    process.exit(1);
  }

  // 1) API kulcs ellenőrzés
  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY. Add it to tools/image-generator/.env.local or export it in your shell.");
    process.exit(1);
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // 2) Job betöltés
  const absJob = path.isAbsolute(jobFile) ? jobFile : path.join(process.cwd(), jobFile);
  const jobRaw = await fs.promises.readFile(absJob, "utf8");
  const job = yaml.load(jobRaw);

  // 3) Output mappa
  const outDir = path.join(process.cwd(), "generated", stamp());
  await ensureDir(outDir);

  // 4) Iterálunk az itemeken
  for (const item of job.items ?? []) {
    const model = item.model ?? "gpt-image-1";
    const size = item.size ?? "1024x1024";
    const n = item.n ?? 1;
    const prompt = item.prompt?.toString().trim();
    if (!prompt) {
      console.warn(`Skip item "${item.name}" — missing prompt`);
      continue;
    }

    console.log(`→ Generating: ${item.name} (n=${n}, size=${size})`);

    // V1: alap generate (alapértelmezett válasz: URL-ek)
    const res = await openai.images.generate({
      model,
      prompt,
      n,
      size
      // NINCS response_format: a jelenlegi API ezt nem fogadja
    });

    // 5) Mentés: próbáljuk előbb URL-t, ha nincs, akkor b64 (robosztus)
    let idx = 0;
    for (const img of res.data) {
      const fname = `${item.name}_${String(idx + 1).padStart(2, "0")}.png`;
      const fpath = path.join(outDir, fname);

      if (img.url) {
        await saveFromUrl(img.url, fpath);
      } else if (img.b64_json) {
        await saveFromB64(img.b64_json, fpath);
      } else {
        console.warn(`   No url/b64_json in response for index ${idx}; skipping.`);
        idx++;
        continue;
      }

      console.log(`   Saved: ${path.relative(process.cwd(), fpath)}`);
      idx++;
    }
  }

  console.log(`✔ All done. Output: ${path.relative(process.cwd(), outDir)}`);
}

main().catch((e) => {
  const msg = (e?.error?.message || e?.message || "").toString();
  if (e?.status === 403 && msg.includes("must be verified")) {
    console.error("\n[403] A gpt-image-1 használatához verifikált szervezet kell.");
    console.error("Lépések:");
    console.error("  1) OpenAI -> Settings -> Organization -> General -> Verify Organization");
    console.error("  2) Ellenőrizd a Billinget (org + a project, amelyhez a sk-proj kulcs tartozik).");
    console.error("  3) Várj pár perc propagációt, majd futtasd újra: npm run imagegen -- jobs/bg.yaml\n");
    process.exit(2);
  } else if (e?.status === 400 && e?.param === "size") {
    console.error("\n[400] Méret hiba. Támogatott: 1024x1024, 1536x1024, 1024x1536, auto.\n");
    process.exit(2);
  } else {
    console.error(e);
    process.exit(1);
  }
});

