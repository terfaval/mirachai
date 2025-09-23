// Headless képgenerátor OpenAI-hoz (gpt-image-1)
// Használat:
//   node scripts/imagegen.js jobs/example.yaml
//
// Főbb képességek:
//  - Stílus presetek (project_style) + lokális felülírás
//  - Méret presetek: desktop_wide(1536x1024) | mobile_tall(1024x1536) | square(1024x1024)
//  - Variánsok (variants): pl. morning/noon/evening – prompt kiegészítéssel
//  - Referencia képek (reference_images[]) és opcionális mask (edit)
//  - Kimeneti struktúra: generated/YYYY-MM-DD_HH-mm-ss/<item>/<variant>/<size>/...
//
// Fontos: A gpt-image-1 jelenleg fix méreteket támogat: 1024x1024 | 1536x1024 | 1024x1536

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import yaml from "js-yaml";
import dotenv from "dotenv";
import sharp from "sharp";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dedikált .env.local betöltés (tools/image-generator/.env.local vagy projekt root)
const ENV_CANDIDATES = [
  path.join(process.cwd(), ".env.local"),
  path.join(__dirname, "..", ".env.local"),
  path.join(process.cwd(), ".env"),
];
for (const p of ENV_CANDIDATES) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

function stamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

async function ensureDir(p) { await fs.promises.mkdir(p, { recursive: true }); }

async function saveFromUrl(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.promises.writeFile(outPath, buf);
}
async function saveFromB64(b64, outPath) {
  const buf = Buffer.from(b64, "base64");
  await fs.promises.writeFile(outPath, buf);
}

// ---- PRESETEK ----
const SIZE_PRESETS = {
  desktop_wide: "1536x1024",
  mobile_tall: "1024x1536",
  square: "1024x1024",
};
const ALLOWED_SIZES = new Set(Object.values(SIZE_PRESETS));

function parseSize(sizeStr) {
  const [w, h] = String(sizeStr).split("x").map(n => parseInt(n, 10));
  if (!w || !h) throw new Error(`Invalid size: ${sizeStr}`);
  return { w, h };
}

async function postCropIfNeeded(filePath, postCropSize) {
  if (!postCropSize) return; // nincs vágás kérve
  const { w, h } = parseSize(postCropSize); // pl. 1536x764
  const img = sharp(filePath);
  const meta = await img.metadata();

  if ((meta.width ?? 0) < w || (meta.height ?? 0) < h) {
    console.warn(
      `      - [post-crop] source smaller than target, skipped: ${meta.width}x${meta.height} -> ${w}x${h}`
    );
    return;
  }

  const outPath = filePath.replace(/\.png$/i, `__${w}x${h}.png`);
  await img
    .extract({
      left: Math.floor((meta.width - w) / 2),
      top: Math.floor((meta.height - h) / 2),
      width: w,
      height: h,
    })
    .toFile(outPath);

  console.log(`      - post-crop saved: ${outPath}`);
}

/**
 * A project szintű stílus preset a YAML "project_style" mezőből jön.
 * Az item saját "style" mezője ezt felülírja/hozzáfűzi.
 */
function buildPrompt({ basePrompt, style, negative }) {
  const parts = [];
  if (basePrompt) parts.push(basePrompt.trim());
  if (style) parts.push(style.trim());
  if (negative) parts.push(`without: ${negative.trim()}`);
  return parts.filter(Boolean).join("\n");
}

// Variant prompt boostok (pl. napszakok)
const VARIANT_HINTS = {
  morning: "soft morning light, gentle highlights, fresh air feeling",
  noon: "neutral daylight, even lighting, clear contrast",
  evening: "warm sunset glow, long soft shadows, cozy ambience",
  night: "dim ambient light, subtle contrast, calm mood",
};

// Loc/URL -> stream vagy URL tömb készítése
function prepareRefImages(refs = []) {
  if (!Array.isArray(refs) || refs.length === 0) return null;
  const arr = [];
  for (const r of refs) {
    try {
      const abs = path.isAbsolute(r) ? r : path.join(process.cwd(), r);
      if (fs.existsSync(abs)) {
        arr.push(fs.createReadStream(abs));
      } else {
        // ha nem file, kezeljük URL-ként
        arr.push(r);
      }
    } catch {
      arr.push(r);
    }
  }
  return arr.length ? arr : null;
}

function resolveSize(sizeOrPreset) {
  if (!sizeOrPreset) return SIZE_PRESETS.desktop_wide;
  if (ALLOWED_SIZES.has(sizeOrPreset)) return sizeOrPreset;
  // preset név?
  if (SIZE_PRESETS[sizeOrPreset]) return SIZE_PRESETS[sizeOrPreset];
  // fallback + figyelmeztetés
  console.warn(`[size] "${sizeOrPreset}" nem támogatott -> desktop_wide (1536x1024) lesz.`);
  return SIZE_PRESETS.desktop_wide;
}

async function runJob(jobPath) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY. Állítsd be a .env.local-ban vagy környezeti változóként.");
    process.exit(1);
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const jobAbs = path.isAbsolute(jobPath) ? jobPath : path.join(process.cwd(), jobPath);
  const jobRaw = await fs.promises.readFile(jobAbs, "utf8");
  const job = yaml.load(jobRaw);

  // kimeneti gyökér
  const rootOut = path.join(process.cwd(), "generated", stamp());
  await ensureDir(rootOut);

  // project-szintű defaultok
  const projectStyle = job?.project_style || "";           // egységes Mirachai-stílus
  const projectNegative = job?.project_negative || "";     // pl. "text, logos, watermarks, people"
  const projectVariants = job?.project_variants || [];     // pl. ["morning","noon","evening"]
  const projectSizes = job?.project_sizes || ["desktop_wide"]; // preset nevek vagy konkrét méret stringek
  const projectN = Number(job?.project_n ?? 1);
  const projectModel = job?.project_model || "gpt-image-1";
  const projectStyleMode = job?.project_style_mode || "natural"; // "natural" | "vivid" (ha támogatott)

  const items = job?.items || [];
  if (!Array.isArray(items) || items.length === 0) {
    console.warn("Nincs items a YAML-ban.");
    return;
  }

  for (const item of items) {
    const itemName = String(item.name || "noname").trim();
    if (!itemName) continue;

    // per-item override-ok
    const model = item.model || projectModel;
    const n = Number(item.n ?? projectN);
    const sizes = (item.sizes?.length ? item.sizes : projectSizes).map(resolveSize);
    const variants = (item.variants?.length ? item.variants : projectVariants);
    const styleMode = item.style_mode || projectStyleMode;

    const basePrompt = (item.prompt || "").toString().trim();
    if (!basePrompt) {
      console.warn(`Skip "${itemName}" — hiányzik a prompt.`);
      continue;
    }
    const style = [projectStyle, item.style || ""].filter(Boolean).join("\n");
    const negative = [projectNegative, item.negative || ""].filter(Boolean).join(", ");

    // referencia képek / maszk
    const refImages = prepareRefImages(item.reference_images);
    const maskPath = item.mask ? (path.isAbsolute(item.mask) ? item.mask : path.join(process.cwd(), item.mask)) : null;
    const useMask = maskPath && fs.existsSync(maskPath);

    console.log(`\n→ ${itemName}`);
    console.log(`   model=${model}, n=${n}, sizes=${sizes.join(", ")}, variants=${variants.join(", ") || "-"}`);

    // kimeneti mappa: /itemName
    const itemOut = path.join(rootOut, itemName);
    await ensureDir(itemOut);

    // ha nincs variáns, úgy kezeljük, mintha egy "base" lenne
    const effectiveVariants = variants.length ? variants : ["base"];

    for (const variant of effectiveVariants) {
      const variantHint = VARIANT_HINTS[variant] || "";
      const prompt = buildPrompt({
        basePrompt,
        style: [style, variantHint].filter(Boolean).join("\n"),
        negative,
      });

      const variantOut = path.join(itemOut, variant);
      await ensureDir(variantOut);

      for (const size of sizes) {
        const sizeOut = path.join(variantOut, size);
        await ensureDir(sizeOut);

        console.log(`   • ${variant} @ ${size}  (n=${n})`);

        try {
          // OpenAI images.generate payload összeállítása
          const payload = {
            model,
            prompt,
            n,
            size,
            style: styleMode, // gpt-image-1 támogatja: "natural" | "vivid"
          };

          // referencia képek mint "image" (variáció / stílusirány)
          if (refImages && refImages.length) {
            // A v4 SDK-ban ugyanazzal a kulccsal lehet több képet adni (image[])
            payload.image = refImages;
          }

          // maszkos szerkesztés (ha van mask és legalább egy kép)
          if (useMask && refImages && refImages.length) {
            payload.mask = fs.createReadStream(maskPath);
            // prompt ilyenkor a látható (nem maszkolt) részek módosítását/mixét vezeti
          }

          const res = await openai.images.generate(payload);

          // mentés
          let idx = 0;
          for (const img of res.data) {
            const fname = `${itemName}__${variant}__${size}__${String(idx + 1).padStart(2, "0")}.png`;
            const fpath = path.join(sizeOut, fname);
            if (img.url) {
              await saveFromUrl(img.url, fpath);
            } else if (img.b64_json) {
              await saveFromB64(img.b64_json, fpath);
            } else {
              console.warn(`      - [skip] nincs url/b64_json (${itemName}/${variant}/${size}/${idx})`);
              idx++;
              continue;
            }
            console.log(`      - saved: ${path.relative(process.cwd(), fpath)}`);
            // középre vágás (pl. 1536x764) – ha kértél ilyet YAML-ban
+            await postCropIfNeeded(fpath, item.post_crop || job.post_crop);
            idx++;
          }
        } catch (e) {
          const msg = (e?.error?.message || e?.message || "").toString();
          if (e?.status === 403 && msg.includes("must be verified")) {
            console.error("\n[403] A gpt-image-1 használatához verifikált szervezet kell.");
            console.error("OpenAI Console: Settings → Organization → Verify + Billing ellenőrzés.");
            process.exit(2);
          } else if (e?.status === 400 && e?.param === "size") {
            console.error("\n[400] Méret hiba. Támogatott: 1024x1024, 1536x1024, 1024x1536, vagy presetek: desktop_wide, mobile_tall, square.\n");
            process.exit(2);
          } else {
            console.error(e);
            process.exit(1);
          }
        }
      }
    }
  }

  console.log(`\n✔ Done. Output root: ${path.relative(process.cwd(), rootOut)}`);
}

(async function main() {
  const jobFile = process.argv[2];
  if (!jobFile) {
    console.error("Usage: node scripts/imagegen.js <job.yaml>");
    process.exit(1);
  }
  await runJob(jobFile);
})();
