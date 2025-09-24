// Headless image generation via OpenAI Images API (prompt-only, stable now)
// Why prompt-only? Your current SDK rejects Responses image tool + edits.
// We'll keep composition explicit in the prompt so the room stays consistent.
//
// Usage examples:
//   node scripts/imagegen_responses.js jobs/room_background_responses.yaml
//   node scripts/imagegen_responses.js jobs/room_background_responses.yaml --only desktop_background_del
//   node scripts/imagegen_responses.js jobs/room_background_responses.yaml --n 2 --size 1024x1024
//   node scripts/imagegen_responses.js jobs/room_background_responses.yaml --dry
//
// Switches:
//   --only <itemName>    Run only a single item by name
//   --n <int>            Override number of images per item (default from YAML)
//   --size <WxH>         Override size for all (must be 1024x1024|1536x1024|1024x1536)
//   --dry                Dry-run: show what would be generated, but don't call the API

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import yaml from "js-yaml";
import dotenv from "dotenv";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- env load ---
for (const p of [
  path.join(process.cwd(), ".env.local"),
  path.join(__dirname, "..", ".env.local"),
  path.join(process.cwd(), ".env"),
]) {
  if (fs.existsSync(p)) { dotenv.config({ path: p }); break; }
}

function stamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
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

const SIZE_PRESETS = {
  desktop_wide: "1536x1024",
  mobile_tall: "1024x1536",
  square: "1024x1024",
};
const ALLOWED_SIZES = new Set(Object.values(SIZE_PRESETS));
function resolveSize(sizeOrPreset) {
  if (!sizeOrPreset) return SIZE_PRESETS.desktop_wide;
  if (ALLOWED_SIZES.has(sizeOrPreset)) return sizeOrPreset;
  if (SIZE_PRESETS[sizeOrPreset]) return SIZE_PRESETS[sizeOrPreset];
  console.warn(`[size] "${sizeOrPreset}" not supported → desktop_wide (1536x1024).`);
  return SIZE_PRESETS.desktop_wide;
}
function parseSize(sizeStr) { const [w, h] = String(sizeStr).split("x").map(n=>parseInt(n,10)); return { w, h }; }

async function postCropIfNeeded(filePath, postCropSize) {
  if (!postCropSize) return;
  const { w, h } = parseSize(postCropSize);
  const img = sharp(filePath);
  const meta = await img.metadata();
  if ((meta.width ?? 0) < w || (meta.height ?? 0) < h) {
    console.warn(`      - [post-crop] smaller than target, skipped: ${meta.width}x${meta.height} -> ${w}x${h}`);
    return;
  }
  const outPath = filePath.replace(/\.png$/i, `__${w}x${h}.png`);
  await img.extract({
    left: Math.floor((meta.width - w)/2),
    top: Math.floor((meta.height - h)/2),
    width: w,
    height: h,
  }).toFile(outPath);
  console.log(`      - post-crop saved: ${outPath}`);
}

function openaiClient() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY in .env.local or environment.");
    process.exit(1);
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function parseArgs(argv) {
  const out = { only: null, n: null, size: null, dry: false };
  for (let i = 3; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry") out.dry = true;
    else if (a === "--only") out.only = argv[++i] || null;
    else if (a === "--n") out.n = parseInt(argv[++i] || "NaN", 10);
    else if (a === "--size") out.size = argv[++i] || null;
  }
  return out;
}

async function runJob(jobPath, cli) {
  const openai = openaiClient();

  const jobAbs = path.isAbsolute(jobPath) ? jobPath : path.join(process.cwd(), jobPath);
  const raw = await fs.promises.readFile(jobAbs, "utf8");
  const job = yaml.load(raw);

  const outRoot = path.join(process.cwd(), "generated", stamp());
  if (!cli.dry) await ensureDir(outRoot);

  // project defaults
  const model = job?.project_model || "gpt-image-1";
  const defaultN = Number(job?.project_n ?? 1);
  const projectSizes = job?.project_sizes?.length ? job.project_sizes : ["desktop_wide"];
  const sizeStrings = projectSizes.map(resolveSize);

  const basePromptBlock = (job?.project_base_prompt || "").toString().trim();
  const negative = (job?.project_negative || "text, logos, watermarks, people, hands").toString();
  const styleReferenceNote = job?.style_reference
    ? `Style reference hint: keep closer to the palette, shading and subtle texture of the SECOND reference image (${job.style_reference}).`
    : "";

  const items = Array.isArray(job?.items) ? job.items : [];

  // filter by --only
  const runItems = cli.only ? items.filter(x => x.name === cli.only) : items;

  if (!runItems.length) {
    console.warn(cli.only
      ? `No item found by name: ${cli.only}`
      : "No items in YAML.");
    return;
  }

  for (const item of runItems) {
    const name = String(item.name || "noname").trim();
    if (!name) continue;

    // sizes (CLI override has precedence)
    const baseSizes = (item.sizes?.length ? item.sizes
                    : item.size ? [item.size]
                    : sizeStrings).map(resolveSize);
    const sizes = cli.size ? [resolveSize(cli.size)] : baseSizes;

    // n (CLI override)
    const n = Number.isInteger(cli.n) && cli.n > 0 ? cli.n : Number(item.n ?? defaultN);

    // LIGHTING
    const light = (item.light || "").toString().trim();
    if (!light) { console.warn(`Skip "${name}" — missing 'light'.`); continue; }

    // Build FULL prompt (explicit layout every time for consistency)
    const fullPrompt =
`FULL ROOM, single wide composition, consistent layout across all variants.
${basePromptBlock}

Lighting:
${light}

${styleReferenceNote}
without: ${negative}`.trim();

    console.log(`\n→ ${name}`);
    console.log(`   model=${model}, n=${n}, sizes=${sizes.join(", ")}`);

    const itemOut = path.join(outRoot, name);
    if (!cli.dry) await ensureDir(itemOut);

    for (const size of sizes) {
      const sizeOut = path.join(itemOut, size);
      if (!cli.dry) await ensureDir(sizeOut);
      console.log(`   • base @ ${size}  (n=${n})`);

      try {
        if (cli.dry) {
          console.log("      - [dry] would call images.generate with prompt & size");
          continue;
        }

        // Prompt-only generate (compatible with your SDK)
        const res = await openai.images.generate({
          model,
          prompt: fullPrompt,
          size,
          n: 1
        });

        if (!res?.data?.length) {
          console.warn(`      - [warn] no images returned (${name}/${size})`);
          continue;
        }

        // Csak az első képet mentjük
        const img = res.data[0];
        const fname = `${name}__${size}.png`;
        const fpath = path.join(sizeOut, fname);
        
        if (img.url) {
            await saveFromUrl(img.url, fpath);
          } else if (img.b64_json) { 
            await saveFromB64(img.b64_json, fpath);
          } else { 
            console.warn(`      - [skip] no url/b64_json (${name}/${size})`);
            continue; 
        }

        console.log(`      - saved: ${path.relative(process.cwd(), fpath)}`);
          await postCropIfNeeded(fpath, item.post_crop || job.post_crop);

      } catch (e) {
        const msg = (e?.error?.message || e?.message || "").toString();
        if (e?.status === 403 && msg.includes("must be verified")) {
          console.error("\n[403] Org must be verified for image generation.");
          process.exit(2);
        } else if (e?.status === 400 && e?.param === "size") {
          console.error("\n[400] Bad size. Supported: 1024x1024, 1536x1024, 1024x1536, or presets desktop_wide, mobile_tall, square.\n");
          process.exit(2);
        } else {
          console.error(e);
          process.exit(1);
        }
      }
    }
  }

  if (!cli.dry) console.log(`\n✔ Done. Output root: ${path.relative(process.cwd(), outRoot)}`);
}

(async function main() {
  const jobFile = process.argv[2];
  if (!jobFile) {
    console.error("Usage: node scripts/imagegen_responses.js <job.yaml> [--only name] [--n 1] [--size 1536x1024] [--dry]");
    process.exit(1);
  }
  const cli = parseArgs(process.argv);
  await runJob(jobFile, cli);
})();
