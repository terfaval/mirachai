// pages/api/chef/concepts.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Ajv from "ajv";
import { Profiles, HealthHeuristics } from "@/lib/chef/rules";
import { ConceptSchema, type ConceptOutput } from "@/lib/chef/schema";
import { renderTemplate, loadText } from "@/lib/chef/template";
import { callLLM } from "@/lib/chef/llm";
import { startTimer, logTelemetry } from "@/lib/chef/telemetry";
import { generateConcepts } from "@/lib/chef/generate"; // rule-based fallback
import crypto from "crypto";

// --- in-memory cache (TTL 10 perc) ---
const CACHE = new Map<string, { until: number; payload: ConceptOutput }>();
const TTL_MS = 10 * 60 * 1000;

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(ConceptSchema);

function cacheKey(dishName?: string, mustHave?: string[]) {
  return JSON.stringify({
    d: (dishName ?? "").trim().toLowerCase(),
    m: (mustHave ?? []).map(s => s.trim().toLowerCase()).sort()
  });
}

// ---- adapter a különböző generateConcepts szignatúrákhoz ----
function callRuleBased(dishName: string, mustHave: string[]): any[] {
  // 1) (dish, mustHave)
  try {
    return (generateConcepts as unknown as (a?: any, b?: any, c?: any) => any[])(dishName, mustHave);
  } catch {}
  // 2) ({ dishName, mustHave })
  try {
    return (generateConcepts as unknown as (a: any) => any[])({ dishName, mustHave });
  } catch {}
  // 3) (dish, mode, mustHave)
  try {
    return (generateConcepts as unknown as (a?: any, b?: any, c?: any) => any[])(dishName, null, mustHave);
  } catch {}
  return [];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const timerEnd = startTimer();
  const reqId = crypto.randomBytes(8).toString("hex");

  try {
    const { dishName, mustHave = [] } = (req.body || {}) as { dishName?: string; mustHave?: string[] };
    const key = cacheKey(dishName, mustHave);
    const now = Date.now();

    // cache
    const cached = CACHE.get(key);
    if (cached && cached.until > now) {
      logTelemetry({ reqId, cacheHit: true, latencyMs: timerEnd(), outputLen: JSON.stringify(cached.payload).length });
      return res.status(200).json(cached.payload);
    }

    const profilesJSON = JSON.stringify(Profiles);
    const heuristicsJSON = JSON.stringify(HealthHeuristics);
    const schemaJSON = JSON.stringify(ConceptSchema);

    const system = await loadText("lib/chef/prompts/system.txt");
    const user = await renderTemplate("lib/chef/prompts/user.template.txt", {
      dish: dishName || "",
      mustHaveCSV: (mustHave || []).join(", "),
      profilesJSON, heuristicsJSON, schemaJSON
    });

    let payload: ConceptOutput;

    try {
      const raw = await callLLM({ system, user, maxTokens: 700, temperature: 0.2, topP: 0.9 });
      const parsed = JSON.parse(raw);

      if (!validate(parsed)) {
        const err = ajv.errorsText(validate.errors);
        throw new Error("Schema validation failed: " + err);
      }
      payload = parsed as ConceptOutput;
    } catch (e) {
      console.warn("[chef.concepts] AI failed, falling back:", e);

      // rule-based fallback illesztése a sémához
      const base = callRuleBased(dishName ?? "", mustHave ?? []);
      let concepts = (Array.isArray(base) ? base : []).map((c: any) => ({
        title: c.title,
        profile: c.profile, // "mediterran" | "balkan" | "azsiai" | "salata"
        summary: c.summary,
        focus: c.focus,
        why_healthy: "Rost- és tápanyagdús superfoodokkal, mérsékelt zsiradékkal.",
        superfoods: ["quinoa"]
      }));

      // ha a rule-based sem adott semmit, adjunk minimális, profil-hű defaultokat
      if (concepts.length === 0) {
        concepts = [
          {
            title: "Mediterrán bowl – quinoa",
            profile: "mediterran",
            summary: "Friss, könnyű mediterrán tál hüvelyesekkel és quinoával.",
            focus: ["több rost", "komplett fehérje"],
            why_healthy: "Hüvelyes + quinoa komplett fehérjét és sok rostot ad.",
            superfoods: ["quinoa"]
          },
          {
            title: "Ázsiai bowl – edamame",
            profile: "azsiai",
            summary: "Gyömbéres-zöldséges tál edamame-val és friss zöldfűszerekkel.",
            focus: ["növényi fehérje", "kevesebb zsiradék"],
            why_healthy: "Edamame és zöldségek magas fehérje- és rosttartalommal.",
            superfoods: ["edamame"]
          }
        ];
      }

      payload = { concepts: concepts.slice(0, 3) };
    }

    // cache set
    CACHE.set(key, { until: now + TTL_MS, payload });

    logTelemetry({
      reqId,
      cacheHit: false,
      latencyMs: timerEnd(),
      outputLen: JSON.stringify(payload).length
    });

    return res.status(200).json(payload);
  } catch (err: any) {
    console.error("[chef.concepts] fatal:", err);
    return res.status(500).json({ error: "chef_concepts_failed" });
  }
}
