// Headless image generation via OpenAI Responses API + image_generation tool
// Reference-based variants: stable room layout, only lighting/style changes.
//
// Usage:
//   node scripts/imagegen_responses.js jobs/room_background_responses.yaml
//
// Requirements:
//   - Node 18+
//   - npm i openai js-yaml dotenv sharp
//   - OPENAI_API_KEY in .env.local or env
//
// Notes:
//   - Two refs supported: project_reference (layout), style_reference (palette/texture)
//   - Sizes: desktop_wide(1536x1024) | mobile_tall(1024x1536) | square(1024x1024)
//   - Output: generated/<timestamp>/<item>/<size>/*.png

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

function fileToDataUri(filePath) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!fs.existsSync(abs)) throw new Error(`Missing file: ${filePath}`);
  const ext = path.extname(abs).toLowerCase().replace(".", "");
  const mime = (ext === "jpg" || ext === "jpeg") ? "image/jpeg"
             : (ext === "png") ? "image/png"
             : "application/octet-stream";
  const b64 = fs.readFileSync(abs).toString("base64");
  return `data:${mime};base64,${b64}`;
}

// Robust extractor across possible SDK shapes
function extractImagesFromResponses(resp) {
  const out = [];
  const arr = resp?.output ?? resp?.data ?? [];
  for (const item of arr) {
    const content = item?.content || [];
    for (const c of content) {
      const img = c?.image || c?.["image"];
      if (!img) continue;
      if (img.url) out.push({ url: img.url });
      if (img.b64_json) out.push({ b64_json: img.b64_json });
    }
  }
  return out;
}

function openaiClient() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY in .env.local or environment.");
    process.exit(1);
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function runJob(jobPath) {
  const openai = openaiClient();

  const jobAbs = path.isAbsolute(jobPath) ? jobPath : path.join(process.cwd(), jobPath);
  const raw = await fs.promises.readFile(jobAbs, "utf8");
  const job = yaml.load(raw);

  const outRoot = path.join(process.cwd(), "generated", stamp());
  await ensureDir(outRoot);

  const model = job?.project_model || "gpt-image-1";
  const n = Number(job?.project_n ?? 1);
  const projectSizes = job?.project_sizes?.length ? job.project_sizes : ["desktop_wide"];
  const sizeStrings = projectSizes.map(resolveSize);
  const baseRef = job?.project_reference;
  const styleRef = job?.style_reference;
  const baseDataUri = fileToDataUri(baseRef);
  const styleDataUri = styleRef ? fileToDataUri(styleRef) : null;

  const basePrompt = (job?.project_base_prompt || "").toString().trim();
  const negative = (job?.project_negative || "text, logos, watermarks, people, hands").toString();
  const items = Array.isArray(job?.items) ? job.items : [];

  if (!baseRef) {
    console.error("project_reference is required in YAML (path to your base room image).");
    process.exit(2);
  }

  for (const item of items) {
    const name = String(item.name || "noname").trim();
    if (!name) continue;

    const sizes = (item.sizes?.length ? item.sizes
                 : item.size ? [item.size]
                 : sizeStrings).map(resolveSize);

    const light = (item.light || "").toString().trim();
    if (!light) { console.warn(`Skip "${name}" — missing 'light'.`); continue; }

    const fullPrompt =
`${basePrompt}

Lighting:
${light}

Keep room layout consistent with the FIRST reference image.
Adopt palette, shading and subtle texture cues from the SECOND reference image (do not change layout).
without: ${negative}`.trim();

    console.log(`\n→ ${name}`);
    console.log(`   model=${model}, n=${n}, sizes=${sizes.join(", ")}`);

    const itemOut = path.join(outRoot, name);
    await ensureDir(itemOut);

    for (const size of sizes) {
      const sizeOut = path.join(itemOut, size);
      await ensureDir(sizeOut);
      console.log(`   • base @ ${size}  (n=${n})`);

      try {
        const content = [
          { type: "input_text", text: fullPrompt },
          { type: "input_image", image_url: baseDataUri },
        ];
        if (styleDataUri) {
          content.push({ type: "input_image", image_url: styleDataUri });
        }

        const resp = await openai.responses.create({
          model,
          input: [{ role: "user", content }],
          tools: [{ type: "image_generation", parameters: { size, n } }],
        });

        const images = extractImagesFromResponses(resp);
        if (!images.length) {
          console.warn(`      - [warn] no images returned (${name}/${size})`);
          // optional: console.dir(resp, {depth:6});
          continue;
        }

        let idx = 0;
        for (const img of images) {
          const fname = `${name}__${size}__${String(idx + 1).padStart(2, "0")}.png`;
          const fpath = path.join(sizeOut, fname);

          if (img.url) await saveFromUrl(img.url, fpath);
          else if (img.b64_json) await saveFromB64(img.b64_json, fpath);
          else { console.warn(`      - [skip] no url/b64_json (${name}/${size}/${idx})`); idx++; continue; }

          console.log(`      - saved: ${path.relative(process.cwd(), fpath)}`);
          await postCropIfNeeded(fpath, item.post_crop || job.post_crop);
          idx++;
        }
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

  console.log(`\n✔ Done. Output root: ${path.relative(process.cwd(), outRoot)}`);
}

(async function main() {
  const jobFile = process.argv[2];
  if (!jobFile) {
    console.error("Usage: node scripts/imagegen_responses.js <job.yaml>");
    process.exit(1);
  }
  await runJob(jobFile);
})();
