import type teas from "../data/teas.json";

export type RawTea = (typeof teas)[number] & {
  id: number | string;
  name: string;
  category?: string;
  subcategory?: string;
};

export const FOCUS_AXES = ["immunity", "relax", "focus", "detox"] as const;
export type FocusAxis = (typeof FOCUS_AXES)[number];

export type TasteMode = "present" | "dominant";

export type ServeMode = "hot" | "lukewarm" | "iced" | "coldbrew";
export const SERVE_MODES: ServeMode[] = ["hot", "lukewarm", "iced", "coldbrew"];

export type IntensityBucket = "enyhe" | "közepes" | "erős";
export const INTENSITY_BUCKETS: IntensityBucket[] = ["enyhe", "közepes", "erős"];

export type CaffeineBucket = "mentes" | "alacsony" | "közepes" | "emeltebb" | "magas";
export const CAFFEINE_BUCKETS: CaffeineBucket[] = [
  "mentes",
  "alacsony",
  "közepes",
  "emeltebb",
  "magas"
];

export type TokenValue = { slug: string; label: string };

export type NormalizedTea = RawTea & {
  categorySlug?: string;
  subcategorySlug?: string;
  tasteMap: Record<string, number>;
  tastePresent: string[];
  tasteDominant: string[];
  focusValues: Record<FocusAxis, number>;
  intensityBucket?: IntensityBucket;
  caffeineBucket?: CaffeineBucket;
  allergenTokens: TokenValue[];
  allergenSlugs: string[];
  seasonTokens: TokenValue[];
  seasonSlugs: string[];
  daypartTokens: TokenValue[];
  daypartSlugs: string[];
  serveModes: ServeMode[];
  serveFlags: Record<ServeMode, boolean>;
  ingredients: string[];
  methodIds: string[];
};

type BrewMethod = {
  method_id: string;
  title?: string;
};

export type BrewProfileDocument = {
  id?: number | string;
  tea_slug?: string;
  methods?: BrewMethod[];
};

export type NormalizeResult = {
  teas: NormalizedTea[];
  categories: TokenValue[];
  subcategories: TokenValue[];
  tastes: TokenValue[];
  allergens: TokenValue[];
  dayparts: TokenValue[];
  seasons: TokenValue[];
  ingredients: string[];
  serveModes: { id: ServeMode; label: string }[];
  intensities: IntensityBucket[];
  caffeineLevels: CaffeineBucket[];
  methods: { id: string; label: string }[];
  methodMap: Record<string, string[]>;
};

const SERVE_LABELS: Record<ServeMode, string> = {
  hot: "Forrón",
  lukewarm: "Langyosan",
  iced: "Jegesen",
  coldbrew: "Coldbrew"
};

const SERVE_MODE_TO_KEY: Record<ServeMode, keyof RawTea | string> = {
  hot: "serve_hot",
  lukewarm: "serve_lukewarm",
  iced: "serve_iced",
  coldbrew: "serve_coldbrew"
};

const INTENSITY_ALIASES: Record<string, IntensityBucket> = {
  enyhe: "enyhe",
  gyenge: "enyhe",
  "nagyon enyhe": "enyhe",
  közepes: "közepes",
  "közepes erősségű": "közepes",
  erős: "erős",
  "nagyon erős": "erős"
};

type NormalizeOptions = {
  brewProfiles?: BrewProfileDocument[];
};

export function slugify(value: string): string {
  return value
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "string" && value.trim()) {
    const normalized = value.replace(",", ".");
    const num = Number(normalized);
    if (Number.isFinite(num)) return num;
  }
  return undefined;
}

function tokenize(value: unknown): TokenValue[] {
  if (value === undefined || value === null) return [];
  const raw = String(value);
  if (!raw.trim()) return [];
  return raw
    .split(/[|,]/)
    .map(part => part.trim())
    .filter(Boolean)
    .map(label => ({ slug: slugify(label), label }));
}

function uniquePush(map: Map<string, string>, token: TokenValue) {
  if (!map.has(token.slug)) {
    map.set(token.slug, token.label);
  }
}

function resolveIntensityBucket(value: unknown): IntensityBucket | undefined {
  if (!value) return undefined;
  const key = String(value).toLowerCase().trim();
  return INTENSITY_ALIASES[key];
}

function resolveCaffeineBucket(value: unknown): CaffeineBucket | undefined {
  const pct = parseNumber(value);
  if (pct === undefined) return undefined;
  if (pct <= 0) return "mentes";
  if (pct <= 20) return "alacsony";
  if (pct <= 50) return "közepes";
  if (pct <= 70) return "emeltebb";
  return "magas";
}

function buildMethodMaps(documents: BrewProfileDocument[] = []) {
  const methodLabels = new Map<string, string>();
  const methodMap: Record<string, string[]> = {};

  for (const doc of documents) {
    const teaId = doc.id ?? doc.tea_slug;
    if (!teaId) continue;
    const key = String(teaId);
    const methods = Array.isArray(doc.methods) ? doc.methods : [];
    const ids: string[] = [];
    for (const method of methods) {
      if (!method || !method.method_id) continue;
      const id = method.method_id;
      ids.push(id);
      if (!methodLabels.has(id)) {
        methodLabels.set(id, method.title || id);
      }
    }
    if (ids.length) {
      methodMap[key] = Array.from(new Set(ids));
    }
  }

  const methodOptions = Array.from(methodLabels.entries())
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "hu", { sensitivity: "base" }));

  return { methodMap, methodOptions };
}

export function normalizeTeas(teas: RawTea[], options: NormalizeOptions = {}): NormalizeResult {
  const categoryMap = new Map<string, string>();
  const subcategoryMap = new Map<string, string>();
  const tasteMap = new Map<string, string>();
  const allergenMap = new Map<string, string>();
  const daypartMap = new Map<string, string>();
  const seasonMap = new Map<string, string>();
  const ingredientSet = new Set<string>();
  const intensitySet = new Set<IntensityBucket>();
  const caffeineSet = new Set<CaffeineBucket>();

  const { methodMap, methodOptions } = buildMethodMaps(options.brewProfiles);

  const normalized = teas.map<NormalizedTea>(tea => {
    const categorySlug = tea.category ? slugify(tea.category) : undefined;
    if (tea.category && categorySlug) {
      uniquePush(categoryMap, { slug: categorySlug, label: tea.category });
    }

    const subcategorySlug = tea.subcategory ? slugify(tea.subcategory) : undefined;
    if (tea.subcategory && subcategorySlug) {
      uniquePush(subcategoryMap, { slug: subcategorySlug, label: tea.subcategory });
    }

    const tasteValues: Record<string, number> = {};
    const tastePresent: string[] = [];
    const tasteDominant: string[] = [];

    for (const [key, value] of Object.entries(tea)) {
      if (key.startsWith("taste_")) {
        const label = key.slice(6).replace(/_/g, " ");
        const slug = slugify(label);
        const num = parseNumber(value) ?? 0;
        tasteValues[slug] = num;
        tasteMap.set(slug, label);
        if (num >= 1) tastePresent.push(slug);
        if (num >= 2) tasteDominant.push(slug);
      }
    }

    const focusValues = FOCUS_AXES.reduce<Record<FocusAxis, number>>((acc, axis) => {
      const key = `focus_${axis}`;
      acc[axis] = parseNumber((tea as Record<string, unknown>)[key]) ?? 0;
      return acc;
    }, {} as Record<FocusAxis, number>);

    const intensityBucket = resolveIntensityBucket((tea as Record<string, unknown>).intensity);
    if (intensityBucket) intensitySet.add(intensityBucket);
    const caffeineBucket = resolveCaffeineBucket((tea as Record<string, unknown>).caffeine_pct);
    if (caffeineBucket) caffeineSet.add(caffeineBucket);

    const allergenTokens = tokenize((tea as Record<string, unknown>).allergens || (tea as Record<string, unknown>).allergene);
    allergenTokens.forEach(token => uniquePush(allergenMap, token));
    const allergenSlugs = allergenTokens.map(t => t.slug);

    const seasonTokens = tokenize((tea as Record<string, unknown>).season_recommended);
    seasonTokens.forEach(token => uniquePush(seasonMap, token));
    const seasonSlugs = seasonTokens.map(t => t.slug);

    const daypartTokens = tokenize((tea as Record<string, unknown>).daypart_recommended);
    daypartTokens.forEach(token => uniquePush(daypartMap, token));
    const daypartSlugs = daypartTokens.map(t => t.slug);

    const serveFlags = SERVE_MODES.reduce<Record<ServeMode, boolean>>((acc, mode) => {
      const key = SERVE_MODE_TO_KEY[mode];
      const raw = key ? (tea as Record<string, unknown>)[key] : undefined;
      const str = typeof raw === "string" ? raw.toLowerCase() : raw;
      acc[mode] = str === true || str === "true" || str === "1" || str === 1;
      return acc;
    }, { hot: false, lukewarm: false, iced: false, coldbrew: false });
    const serveModes = SERVE_MODES.filter(mode => serveFlags[mode]);

    const ingredients: string[] = [];
    for (const [key, value] of Object.entries(tea)) {
      if (/(ingerdient|ingredient)-\d+/.test(key) && typeof value === "string") {
        const token = value.trim().toLowerCase();
        if (token && !ingredients.includes(token)) {
          ingredients.push(token);
          ingredientSet.add(token);
        }
      }
    }

    const teaKey = String(tea.id);
    const methodIds = methodMap[teaKey] ? [...methodMap[teaKey]] : [];

    return {
      ...tea,
      categorySlug,
      subcategorySlug,
      tasteMap: tasteValues,
      tastePresent,
      tasteDominant,
      focusValues,
      intensityBucket,
      caffeineBucket,
      allergenTokens,
      allergenSlugs,
      seasonTokens,
      seasonSlugs,
      daypartTokens,
      daypartSlugs,
      serveModes,
      serveFlags,
      ingredients,
      methodIds
    };
  });

  const categories = Array.from(categoryMap.entries())
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "hu", { sensitivity: "base" }));

  const subcategories = Array.from(subcategoryMap.entries())
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "hu", { sensitivity: "base" }));

  const tastes = Array.from(tasteMap.entries())
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "hu", { sensitivity: "base" }));

  const allergens = Array.from(allergenMap.entries())
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "hu", { sensitivity: "base" }));

  const dayparts = Array.from(daypartMap.entries())
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "hu", { sensitivity: "base" }));

  const seasons = Array.from(seasonMap.entries())
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "hu", { sensitivity: "base" }));

  const ingredients = Array.from(ingredientSet.values()).sort((a, b) => a.localeCompare(b, "hu", { sensitivity: "base" }));

  const serveModes = SERVE_MODES.map(mode => ({ id: mode, label: SERVE_LABELS[mode] }));

  const intensities = INTENSITY_BUCKETS.filter(bucket => intensitySet.has(bucket));
  const caffeineLevels = CAFFEINE_BUCKETS.filter(bucket => caffeineSet.has(bucket));

  return {
    teas: normalized,
    categories,
    subcategories,
    tastes,
    allergens,
    dayparts,
    seasons,
    ingredients,
    serveModes,
    intensities,
    caffeineLevels,
    methods: methodOptions,
    methodMap
  };
}
