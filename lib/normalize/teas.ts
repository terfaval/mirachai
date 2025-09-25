// lib/normalize/teas.ts
import { slugify } from './slugify';
import {
  type CaffeineBucket,
  type IntensityBucket,
  type ServeMode,
  type NormalizeResult,
  type BrewProfileDocument,
} from './types';

export type RawTea = Record<string, any>;

export interface NormalizedTea {
  id: string;
  name: string;

  // alapszintek
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  subcategorySlug?: string;

  // ízek
  tasteDominant?: string[];   // slugok
  tastePresent?: string[];    // slugok

  // bucketek
  intensityBucket?: IntensityBucket;
  caffeineBucket?: CaffeineBucket;

  // ajánlások
  daypartSlugs?: string[];    // slugok
  seasonSlugs?: string[];     // slugok

  // szervírozás / összetevők / allergének / metódusok
  serveModes?: ServeMode[];   // 'hot' | 'iced' | ...
  ingredients?: string[];     // lowercase, _-es
  allergenSlugs?: string[];   // slugok
  methodIds?: string[];       // brew method ID-k

  // bármi másra hagyjuk nyitva
  [key: string]: any;
}

// ——— segéd: rugalmas tömbesítés
function toArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String);
  if (val == null) return [];
  return String(val)
    .split(/[;,|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const SERVE_WHITELIST: ServeMode[] = ['hot', 'iced', 'coldbrew', 'lukewarm'];

export function normalizeTeas(
  raw: RawTea[] = [],
  opts?: { brewProfiles?: BrewProfileDocument[] }
): NormalizeResult {
  const methodsDict = new Map<string, string>();
  if (opts?.brewProfiles) {
    for (const doc of opts.brewProfiles) {
      const list = Array.isArray(doc.methods) ? doc.methods : [];
      for (const m of list) {
        if (m?.id) methodsDict.set(m.id, m.label ?? m.id);
      }
    }
  }

  const categories = new Map<string, string>();
  const subcategories = new Map<string, string>();
  const tastes = new Map<string, string>();
  const intensities = new Set<IntensityBucket>();
  const caffeineLevels = new Set<CaffeineBucket>();
  const dayparts = new Map<string, string>();
  const seasons = new Map<string, string>();
  const serveModes = new Set<ServeMode>();
  const ingredients = new Set<string>();
  const allergens = new Map<string, string>();
  const methods = new Set<string>();

  const teas: NormalizedTea[] = raw.map((t) => {
    const name = t?.name ?? '';
    const id = (t?.id ?? '').toString() || slugify(name);

    // category
    const category = t?.category ?? t?.kategoria ?? t?.category_name;
    const categorySlug = category ? slugify(category) : undefined;
    if (category && categorySlug) categories.set(categorySlug, String(category));

    // subcategory
    const subcategory = t?.subcategory ?? t?.alkategoria ?? t?.subcategory_name;
    const subcategorySlug = subcategory ? slugify(subcategory) : undefined;
    if (subcategory && subcategorySlug) subcategories.set(subcategorySlug, String(subcategory));

    // tastes
    const tasteDominant = toArray(t?.taste_dominant ?? t?.dominant_tastes).map(slugify);
    const tastePresent = toArray(t?.taste_present ?? t?.present_tastes).map(slugify);
    for (const s of [...tasteDominant, ...tastePresent]) tastes.set(s, s.replace(/-/g, ' '));

    // buckets
    const intensityBucket = (t?.intensity_bucket ?? t?.intensity) as IntensityBucket | undefined;
    if (intensityBucket) intensities.add(intensityBucket);

    const caffeineBucket = (t?.caffeine_bucket ?? t?.caffeine) as CaffeineBucket | undefined;
    if (caffeineBucket) caffeineLevels.add(caffeineBucket);

    // dayparts / seasons
    const daypartSlugs = toArray(t?.daypart_recommended).map(slugify);
    for (const s of daypartSlugs) dayparts.set(s, s.replace(/-/g, ' '));

    const seasonSlugs = toArray(t?.season_recommended).map(slugify);
    for (const s of seasonSlugs) seasons.set(s, s.replace(/-/g, ' '));

    // serve modes
    const serve = toArray(t?.serve_modes).map((x) => x.toLowerCase()) as ServeMode[];
    const serveFiltered = serve.filter((m) => SERVE_WHITELIST.includes(m));
    serveFiltered.forEach((m) => serveModes.add(m));

    // ingredients / allergens
    const ing = toArray(t?.ingredients).map((x) => x.toLowerCase().replace(/\s+/g, '_'));
    ing.forEach((x) => ingredients.add(x));

    const allergenSlugs = toArray(t?.allergens).map(slugify);
    allergenSlugs.forEach((s) => allergens.set(s, s.replace(/-/g, ' ')));

    // methods
    const rawMethodIds =
      (Array.isArray(t?.method_ids) ? t.method_ids : toArray(t?.method_ids)) as string[];
    rawMethodIds.forEach((id) => methods.add(id));

    return {
      ...t,
      id,
      name,
      category,
      categorySlug,
      subcategory,
      subcategorySlug,
      tasteDominant,
      tastePresent,
      intensityBucket,
      caffeineBucket,
      daypartSlugs,
      seasonSlugs,
      serveModes: serveFiltered,
      ingredients: ing,
      allergenSlugs,
      methodIds: rawMethodIds,
    };
  });

  return {
    teas,
    categories: [...categories].map(([slug, label]) => ({ slug, label })),
    subcategories: [...subcategories].map(([slug, label]) => ({ slug, label })),
    tastes: [...tastes].map(([slug, label]) => ({ slug, label })),
    intensities: [...intensities],
    caffeineLevels: [...caffeineLevels],
    dayparts: [...dayparts].map(([slug, label]) => ({ slug, label })),
    seasons: [...seasons].map(([slug, label]) => ({ slug, label })),
    serveModes: [...serveModes].map((id) => ({ id, label: id })),
    ingredients: [...ingredients],
    allergens: [...allergens].map(([slug, label]) => ({ slug, label })),
    methods: [...(methodsDict.size ? methodsDict : new Map([...methods].map(id => [id, id])))]
      .map(([id, label]) => ({ id, label })),
  };
}
