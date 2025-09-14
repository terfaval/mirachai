/*
 * Brewing data integration API
 * Provides functions to access tea brewing profiles and equipment guides.
 */

// =====================
// Type declarations
// =====================

export type FlavorSuggestion = { hint: string; dose?: string; when?: string };
export type NotesPerStep = { amount?: string; temp?: string; steep?: string; finish?: string };
export type SpoonEquiv = { teaspoon_g?: number | null; tablespoon_g?: number | null };
export type EquipmentRef = { code: string; howto_ref: string };
export type BrewProfile = {
  profile_id: "hot_standard" | "cold_brew" | "essence" | "gongfu" | string;
  label: string;
  equipment: EquipmentRef[];
  water_temp_c: number;
  ratio_g_per_100ml: number;
  time_s?: number;
  time_h?: string;
  multi_infusions?: number[];
  rounding_g?: number;
  spoon_equiv?: SpoonEquiv;
  notes_per_step?: NotesPerStep;
  finish_message?: string;
  flavor_suggestions?: FlavorSuggestion[];
  target_volume_ml_default?: number;
};
export type BrewDoc = {
  tea_slug: string;
  tea_name: string;
  grams_per_tsp: { measured: number | null; estimated: number };
  profiles: BrewProfile[];
};
export type EquipmentGuide = {
  code: string;
  name: string;
  desc?: string;
  capacity_ml_range?: [number, number];
  best_methods?: string[];
  best_tea_types?: string[];
  steps: string[];
  do?: string[];
  dont?: string[];
  cleaning?: string;
};

// =====================
// Internal helpers
// =====================

const brewCache: Record<string, BrewDoc[]> = {};
const equipmentCache: Record<string, EquipmentGuide[]> = {};

const isBrowser = typeof window !== "undefined" && typeof window.fetch === "function";

async function loadJSON<T>(basePath: string, file: string): Promise<T> {
  const normBase = basePath.replace(/\/$/, "").replace(/^\//, "");
  if (isBrowser) {
    const url = `/${normBase}/${file}`.replace(/\/+/, "/");
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return (await res.json()) as T;
  } else {
    const fs = await import("fs/promises");
    const path = await import("path");
    const full = path.resolve(process.cwd(), normBase, file);
    const txt = await fs.readFile(full, "utf8");
    return JSON.parse(txt) as T;
  }
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function deriveFromTeas(teas: any[]): BrewDoc[] {
  const docs: BrewDoc[] = teas.map((t) => {
    const slug = slugify(t.name);
    const grams_per_tsp = { measured: null, estimated: 1.8 };
    const grams250 = (t.quantity_250ml ?? 1) * grams_per_tsp.estimated;
    const ratio = grams250 / 2.5; // per 100ml
    const profile: BrewProfile = {
      profile_id: "hot_standard",
      label: "Hagyományos forró áztatás",
      equipment: [
        { code: "teapot", howto_ref: "teapot" },
        { code: "infuser", howto_ref: "infuser" },
      ],
      water_temp_c: t.tempC ?? 95,
      ratio_g_per_100ml: ratio,
      time_s: Math.round((t.steepMin ?? 5) * 60),
      rounding_g: 0.1,
      notes_per_step: {
        amount: "Mérd grammra – kanál csak közelítő (~).",
        temp: "Előmelegített bögre/kanna javítja az ízt.",
        steep: "Fedő alatt áztasd a teljes időt.",
        finish: "Finom szűrés, majd 1 perc pihentetés tálalás előtt.",
      },
      flavor_suggestions: [
        { hint: "méz", dose: "0.5–1 tk / 250 ml", when: "áztatás után" },
      ],
    };
    return { tea_slug: slug, tea_name: t.name, grams_per_tsp, profiles: [profile] };
  });
  return docs;
}

async function loadBrewDocs(basePath = "/data"): Promise<BrewDoc[]> {
  if (!brewCache[basePath]) {
    try {
      const docs = await loadJSON<any[]>(basePath, "brew_profiles.json");
      const valid =
        Array.isArray(docs) &&
        docs.length > 0 &&
        typeof docs[0]?.tea_slug === "string" &&
        Array.isArray(docs[0]?.profiles);
      if (valid) {
        brewCache[basePath] = docs as BrewDoc[];
      } else {
        throw new Error("invalid");
      }
    } catch {
      const teas = await loadJSON<any[]>(basePath, "teas.json");
      brewCache[basePath] = deriveFromTeas(teas);
    }
  }
  return brewCache[basePath];
}

async function loadEquipment(basePath = "/data"): Promise<EquipmentGuide[]> {
  if (!equipmentCache[basePath]) {
    try {
      equipmentCache[basePath] = await loadJSON<EquipmentGuide[]>(basePath, "equipment_guide.json");
    } catch {
      equipmentCache[basePath] = [];
    }
  }
  return equipmentCache[basePath];
}

function scaleFlavorSuggestions(sugs: FlavorSuggestion[] | undefined, volume_ml: number): FlavorSuggestion[] {
  if (!sugs) return [];
  const factor = volume_ml / 250;
  return sugs.map((s) => {
    let dose = s.dose;
    if (dose && /\d/.test(dose) && factor !== 1) {
      dose = `${dose} ×${factor.toFixed(2)}`;
    }
    return { ...s, dose };
  });
}

// =====================
// Public API functions
// =====================

export async function listTeas(basePath = "/data"): Promise<{ slug: string; name: string }[]> {
  const docs = await loadBrewDocs(basePath);
  return docs.map((d) => ({ slug: d.tea_slug, name: d.tea_name }));
}

export async function getProfiles(tea_slug: string, basePath = "/data"): Promise<BrewProfile[]> {
  const docs = await loadBrewDocs(basePath);
  return docs.find((d) => d.tea_slug === tea_slug)?.profiles ?? [];
}

export function calcGrams(ratio_g_per_100ml: number, volume_ml: number, rounding_g = 0.1): number {
  const grams = (ratio_g_per_100ml * volume_ml) / 100;
  const step = rounding_g ?? 0.1;
  return Number((Math.round(grams / step) * step).toFixed(2));
}

export function gramsToTsp(grams: number, teaspoon_g?: number | null): number | null {
  if (!teaspoon_g || teaspoon_g <= 0) return null;
  const tsp = grams / teaspoon_g;
  return Number((Math.round(tsp * 10) / 10).toFixed(2));
}

export function buildSteps(
  profile: BrewProfile,
  volume_ml: number,
  teaspoon_g?: number | null
): {
  steps: Array<{ title: string; action: string; timer_seconds?: number; on_complete_message?: string; timer_hint?: string }>;
  grams: number;
  tspApprox: number | null;
  flavor: FlavorSuggestion[];
} {
  const steps: Array<{ title: string; action: string; timer_seconds?: number; on_complete_message?: string; timer_hint?: string }> = [];

  // Step 1: volume
  steps.push({ title: "Mennyiség", action: `${volume_ml} ml` });

  // Step 2: water temp
  const tempText = profile.water_temp_c === 4 ? "Hűtő / ~4 °C" : `${profile.water_temp_c} °C`;
  let step2Action = tempText;
  if (profile.notes_per_step?.temp) step2Action += ` – ${profile.notes_per_step.temp}`;
  steps.push({ title: "Víz hőmérséklet", action: step2Action });

  // Step 3: ingredient ratio
  const grams = calcGrams(profile.ratio_g_per_100ml, volume_ml, profile.rounding_g ?? 0.1);
  const tspApprox = gramsToTsp(grams, teaspoon_g ?? profile.spoon_equiv?.teaspoon_g ?? undefined);
  let step3Action = `Mérj ${grams} g teát`;
  if (tspApprox !== null) step3Action += ` (~${tspApprox} tk)`;
  if (profile.notes_per_step?.amount) step3Action += ` – ${profile.notes_per_step.amount}`;
  steps.push({ title: "Hozzávaló arányok", action: step3Action });

  // Step 4: steeping
  let step4Action = "";
  let timer_seconds: number | undefined;
  let timer_hint: string | undefined;
  if (profile.multi_infusions && profile.multi_infusions.length) {
    step4Action = profile.multi_infusions
      .map((t, i) => `${i + 1}. ${t} mp`)
      .join(" / ");
    timer_hint = profile.multi_infusions.join(",");
  } else if (profile.time_s) {
    step4Action = `${profile.time_s} mp`;
    timer_seconds = profile.time_s;
  } else if (profile.time_h) {
    step4Action = `${profile.time_h} óra`;
  }
  const steepNotes = [profile.notes_per_step?.steep, profile.notes_per_step?.finish].filter(Boolean).join(" ");
  if (steepNotes) step4Action += ` – ${steepNotes}`;
  const step4: { title: string; action: string; timer_seconds?: number; on_complete_message?: string; timer_hint?: string } = {
    title: "Áztatás",
    action: step4Action,
  };
  if (timer_seconds) step4.timer_seconds = timer_seconds;
  if (timer_hint) step4.timer_hint = timer_hint;
  if (profile.finish_message) step4.on_complete_message = profile.finish_message;
  steps.push(step4);

  // Step 5: flavor suggestions
  const flavor = scaleFlavorSuggestions(profile.flavor_suggestions, volume_ml);
  if (flavor.length) {
    const action = flavor
      .map((f) => {
        let txt = f.hint;
        if (f.dose) txt += ` (${f.dose})`;
        if (f.when) txt += ` – ${f.when}`;
        return txt;
      })
      .join("; ");
    steps.push({ title: "Ízesítés", action });
  }

  return { steps, grams, tspApprox, flavor };
}

export async function getEquipmentHowTo(code: string, basePath = "/data"): Promise<EquipmentGuide | undefined> {
  const equipment = await loadEquipment(basePath);
  return equipment.find((e) => e.code === code);
}
