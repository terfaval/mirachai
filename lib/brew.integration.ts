import { computeGramsPer100Ml, parseSimpleRatio, validateBrewProfiles } from './brew.profileUtils';

/**
 * Brew integration facade
 * Egységes belépési pont a UI-nak: method-list, plan build, equipment howto.
 */

export type BrewMethodPlan = {
  method_id: string;
  method_label: string;
  volume_ml: number;
  grams: number;
  tspApprox: number | null;
  tempC: number;
  timer_seconds?: number;     // ha egyszeri
  timer_hint?: string;        // ha több leöntés, pl. "15,12,15,20"
  steps: Array<{ title: string; action: string }>;
  gear: string[];             // raw gear kódok/megnevezések a JSON-ból
  notes?: string[];
  cautions?: string[];
  finish_message?: string;
};

// ---- JSON loader (no fs/promises; működik böngészőben is) -------------------

type KnownJson =
  | 'brew_profiles.json'
  | 'brew_descriptions.json'
  | 'equipment_guide.json'
  | 'teas.json';

async function loadJSON<T>(file: KnownJson): Promise<T> {
  switch (file) {
    case 'brew_profiles.json':
      return (await import('../data/brew_profiles.json')).default as T;
    case 'brew_descriptions.json':
      return (await import('../data/brew_descriptions.json')).default as T;
    case 'equipment_guide.json':
      return (await import('../data/equipment_guide.json')).default as T;
    case 'teas.json':
      return (await import('../data/teas.json')).default as T;
    default:
      throw new Error(`Unknown data file: ${file satisfies never}`);
  }
}

// ---- belső típusok + cachek -------------------------------------------------

type TeaProfiles = Array<{
  slug?: string; id?: string; name: string;
  methods: Array<any>;
}>;
type BrewDescriptions = Array<{
  tea: string; method: string; one_liner?: string; steps_text?: string;
}>;
type EquipmentItem = { code: string; name: string; desc?: string; steps?: string[] };

let _profiles: TeaProfiles | null = null;
let _descs: BrewDescriptions | null = null;
let _equipment: Array<EquipmentItem> | null = null;

async function getProfilesJSON(): Promise<TeaProfiles> {
  if (_profiles) return _profiles;
  _profiles = await loadJSON<TeaProfiles>('brew_profiles.json');
  validateBrewProfiles(_profiles, 'lib/brew.integration.ts');
  return _profiles!;
}
async function getDescriptionsJSON(): Promise<BrewDescriptions> {
  if (_descs) return _descs;
  try { _descs = await loadJSON<BrewDescriptions>('brew_descriptions.json'); }
  catch { _descs = []; }
  return _descs!;
}
async function getEquipmentJSON(): Promise<Array<EquipmentItem>> {
  if (_equipment) return _equipment;
  try { _equipment = await loadJSON<Array<EquipmentItem>>('equipment_guide.json'); }
  catch { _equipment = []; }
  return _equipment!;
}

function slugify(str: string): string {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function findTea(all: TeaProfiles, slugOrName: string) {
  const target = slugify(slugOrName);
  return all.find((t) => {
    const slug = t.slug ? slugify(t.slug) : slugify(t.name);
    return slug === target || String(t.id) === slugOrName || t.name === slugOrName;
  });
}

// ---- publikus API ------------------------------------------------------------

/** Tea → elérhető módszerek (dinamikus, nem csak core) */
export async function listMethodsForTea(teaSlug: string): Promise<Array<{id:string; label:string}>> {
  const all = await getProfilesJSON();
  const tea = findTea(all, teaSlug);
  if (!tea) return [];
  const out: Array<{id:string; label:string}> = [];
  const seen = new Set<string>();
  for (const m of (tea.methods ?? [])) {
    const id = String(m.method_id);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ id, label: m.title || id });
  }
  return out;
}

/** Ratio string → g/100ml (gramm/ml alapú) */
function parseRatioToGramsPer100ml(ratio: string): { g_per_100ml: number | null; tsp_g_hint: number | null } {
  const parsed = parseSimpleRatio(ratio);
  const gPer100 = computeGramsPer100Ml(parsed);
  return { g_per_100ml: gPer100 ?? null, tsp_g_hint: null };
}

/** "a-b" perc/szám → másodperc (középérték), multi infusions → CSV hint */
function pickTimeSeconds(fields: { steepMin?: any; time_s?: any; time_h?: any; multi_infusions?: any }): { seconds?: number; hintCsv?: string } {
  if (fields.multi_infusions && Array.isArray(fields.multi_infusions) && fields.multi_infusions.length) {
    return { hintCsv: fields.multi_infusions.join(',') };
  }
  if (fields.time_s != null) return { seconds: Number(fields.time_s) };

  // "8-12" óra → középérték
  if (fields.time_h) {
    const str = String(fields.time_h);
    const range = str.match(/(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)/);
    if (range) {
      const a = parseFloat(range[1].replace(',','.'));
      const b = parseFloat(range[2].replace(',','.'));
      return { seconds: Math.round(((a + b) / 2) * 3600) };
    }
    const h = parseFloat(str.replace(',','.'));
    if (isFinite(h) && h > 0) return { seconds: Math.round(h * 3600) };
  }

  const sm = fields.steepMin;
  if (sm != null) {
    if (typeof sm === 'number') return { seconds: Math.round(sm * 60) };
    const m = String(sm).match(/(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)/);
    if (m) {
      const a = parseFloat(m[1].replace(',','.'));
      const b = parseFloat(m[2].replace(',','.'));
      return { seconds: Math.round(((a + b) / 2) * 60) };
    }
    const n = parseFloat(String(sm).replace(',','.'));
    if (isFinite(n)) return { seconds: Math.round(n * 60) };
  }
  return {};
}

/** Tsp becslés, ha van tsp gramm hint; különben null */
function gramsToTsp(grams: number, teaspoon_g?: number | null): number | null {
  if (!teaspoon_g || teaspoon_g <= 0) return null;
  const tsp = grams / teaspoon_g;
  return Math.round(tsp * 10) / 10;
}

/** (opcionális) leírások – későbbre, ha kell */
export async function getDescriptionFor(teaSlug: string, methodId: string) {
  const descs = await getDescriptionsJSON();
  const target = slugify(teaSlug);
  return (
    descs.find(
      (d) => slugify(d.tea) === target && d.method === methodId,
    ) || null
  );
}

/** Teljes terv összerakása a UI-nak */
export async function buildPlanFor(teaSlug: string, methodId: string, volumeMl: number): Promise<BrewMethodPlan | null> {
  const all = await getProfilesJSON();
  const tea = findTea(all, teaSlug);
  if (!tea) return null;
  const m = (tea.methods ?? []).find((x:any) => String(x.method_id) === methodId);
  if (!m) return null;

  const tempC: number = Number(m.tempC ?? 95);

  const { g_per_100ml, tsp_g_hint } = parseRatioToGramsPer100ml(String(m.ratio ?? ''));
  if (g_per_100ml == null) return null; // az audit szerint minden módszernél számolható arány van

  const gramsRaw = (g_per_100ml * volumeMl) / 100;
  const grams = Math.round(gramsRaw * 10) / 10;
  const tspApprox = gramsToTsp(grams, tsp_g_hint ?? null);

  const { seconds, hintCsv } = pickTimeSeconds({
    steepMin: m.steepMin, time_s: m.time_s, time_h: m.time_h, multi_infusions: m.multi_infusions
  });

  const steps: Array<{title:string; action:string}> = [];
  if (m.steps && typeof m.steps === 'string') {
    steps.push(...m.steps.split('\n').filter(Boolean).map((line:string) => ({ title: 'Lépés', action: line })));
  } else if (Array.isArray(m.steps)) {
    steps.push(...m.steps.map((line:string) => ({ title: 'Lépés', action: line })));
  } else {
    // generált minimál lépések
    steps.push({ title: 'Mennyiség', action: `${volumeMl} ml` });
    steps.push({ title: 'Hőfok', action: `${tempC} °C` });
    steps.push({ title: 'Alapanyag', action: `${grams} g tea${tspApprox ? ` (~${tspApprox} tk)` : ''}` });
    if (seconds) steps.push({ title: 'Áztatás', action: `${seconds} mp` });
    if (hintCsv) steps.push({ title: 'Leöntések', action: hintCsv.split(',').map((s:string,i:number)=>`${i+1}. ${s.trim()} mp`).join(' / ') });
  }

  return {
    method_id: methodId,
    method_label: m.title || methodId,
    volume_ml: volumeMl,
    grams,
    tspApprox,
    tempC,
    timer_seconds: seconds,
    timer_hint: hintCsv,
    steps,
    gear: Array.isArray(m.gear) ? m.gear : [],
    notes: m.notes || [],
    cautions: m.caution_notes || [],
    finish_message: m.finish_message,
  };
}

/** Equipment how-to (egyszerű lookup) */
export async function getEquipmentHowTo(code: string) {
  const list = await getEquipmentJSON();
  return list.find(e => e.code === code);
}
