// scripts/check-openai.js
// Gyors diagnosztika: env betöltés, chat és image API próba, barátságos hibák.

import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Kifejezetten a tools/image-generator/.env.local betöltése
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

function head(s, n = 60) {
  if (!s) return "";
  const t = s.toString();
  return t.length > n ? t.slice(0, n) + "…" : t;
}

function banner(t) {
  console.log("\n" + "═".repeat(60));
  console.log(" " + t);
  console.log("═".repeat(60));
}

async function testChat(client) {
  banner("CHAT TESZT (gpt-4o-mini)");
  try {
    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "reply with: ok" }],
    });
    const msg = r?.choices?.[0]?.message?.content ?? "";
    console.log("✅ Chat OK:", head(msg));
    return true;
  } catch (e) {
    console.error("❌ Chat hiba:", e.status ?? "", e?.error?.message || e.message);
    if (e?.status === 401) console.error("   → Rossz/lejárt kulcs, vagy nincs Billing.");
    return false;
  }
}

async function testImage(client) {
  banner("IMAGE TESZT (gpt-image-1, 1024x1024)");
  try {
    const r = await client.images.generate({
      model: "gpt-image-1",
      prompt: "one-color test background",
      n: 1,
      size: "1024x1024",
    });
    const url = r?.data?.[0]?.url;
    console.log("✅ Image OK. URL elérhető?", !!url, url ? head(url) : "");
    return true;
  } catch (e) {
    const msg = e?.error?.message || e.message || "";
    console.error("❌ Image hiba:", e.status ?? "", msg);

    // Barátságos magyarázatok a gyakori esetekre
    if (e?.status === 403 && msg.toLowerCase().includes("must be verified")) {
      console.error("   → A gpt-image-1 használatához verifikált szervezet/projekt kell.");
      console.error("     Lépések: Settings → Organization → Verify Organization (+ Billing),");
      console.error("     vagy válts olyan projektre/kulcsra, ahol a model elérhető.");
    } else if (e?.status === 400 && e?.param === "size") {
      console.error("   → Méret hiba. Támogatott: 1024x1024, 1536x1024, 1024x1536, auto.");
    } else if (e?.status === 401) {
      console.error("   → 401: Kulcs/billing probléma.");
    }
    return false;
  }
}

async function main() {
  banner("ENV ELLENŐRZÉS");
  const len = (process.env.OPENAI_API_KEY || "").length;
  console.log("OPENAI_API_KEY length:", len);
  if (!len) {
    console.error("❌ Nincs kulcs betöltve. Ellenőrizd: tools/image-generator/.env.local");
    process.exit(1);
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const chatOk  = await testChat(client);
  const imgOk   = await testImage(client);

  banner("ÖSSZEGZÉS");
  console.log("Chat:", chatOk ? "OK" : "HIBA");
  console.log("Image:", imgOk ? "OK" : "HIBA");
  if (!imgOk) {
    console.log("\nHa gyorsan szeretnél tovább haladni org-verify nélkül: tudok adni drop-in scriptet más providerre (Stability/Replicate), ugyanazzal a YAML-lal.");
  }
  process.exit(imgOk && chatOk ? 0 : 2);
}

main().catch((e) => {
  console.error("Váratlan hiba:", e);
  process.exit(1);
});
