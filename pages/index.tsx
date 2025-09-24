import { GetStaticProps } from 'next';
import { useState, useEffect, useMemo, useCallback } from 'react';
import path from 'path';
import { promises as fs } from 'fs';
import TeaGrid from '../components/TeaGrid';
import Header from '../components/Header';
import { SortKey } from '../components/sortOptions';
import TeaModal from '../components/TeaModal';
import CategorySidebar from '../components/CategorySidebar';
import PaginationBar from '../components/PaginationBar';
import { usePagination } from '../hooks/usePagination';
import { useTeaGridLayout } from '../hooks/useTeaGridLayout';
import { toStringArray } from '../lib/toStringArray';
import {
  normalizeTeas,
  type NormalizeResult,
  type NormalizedTea,
  type BrewProfileDocument,
} from '../lib/normalize';
import FilterPanel, { type FilterPanelData } from '../src/ui/filters/FilterPanel';
import {
  applyFilters,
  createEmptyFilterState,
  type FilterState,
} from '../lib/tea-filters';
import { distributeByCategory } from '../utils/category-distribution';
import type { Tea } from '../utils/filter';

/* ---------- stabil “véletlen” ---------- */
function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}
function deterministicShuffle<T extends { id: number | string }>(arr: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  // Fisher–Yates a MÁSOLATON, de determinisztikus rand-dal
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/* -------------------------------------- */

function normalizeString(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function getSeason(date: Date): string {
  const m = date.getMonth(); const d = date.getDate();
  if (m < 2 || (m === 2 && d < 21)) return 'tel';
  if (m < 5 || (m === 5 && d < 21)) return 'tavasz';
  if (m < 8 || (m === 8 && d < 22)) return 'nyar';
  if (m < 11 || (m === 11 && d < 21)) return 'osz';
  return 'tel';
}
const SEASON_START: Record<string, number> = { tel: 11, tavasz: 2, nyar: 5, osz: 8 };
function seasonDistance(now: Date, season: string): number {
  const month = now.getMonth(); const start = SEASON_START[season];
  let dist = start - month; if (dist < 0) dist += 12; return dist;
}
function seasonScore(seasons: string[], now: Date): number {
  const normSeasons = seasons.map((s) => normalizeString(s));
  const current = getSeason(now);
  if (normSeasons.length === 0) return 0;
  if (normSeasons.length === 1 && normSeasons[0] === current) return 30;
  if (normSeasons.includes(current)) {
    let minDist = 12;
    for (const s of normSeasons) { if (s === current) continue;
      const d = seasonDistance(now, s); if (d < minDist) minDist = d; }
    let score = 20 - minDist;
    if (normSeasons.length >= 3) score -= 5;
    return Math.max(0, score);
  }
  let minDist = 12;
  for (const s of normSeasons) { const d = seasonDistance(now, s); if (d < minDist) minDist = d; }
  return Math.max(0, 10 - minDist);
}
function daypartPrefs(now: Date): string[] {
  const h = now.getHours(); const prefs: string[] = [];
  if (h >= 20 || h < 4) prefs.push('lefekves_elott');
  if ((h >= 12 && h <= 13) || (h >= 18 && h <= 21)) prefs.push('etkezes_utan');
  if (h >= 4 && h < 10) prefs.push('reggel');
  if (h >= 10 && h < 12) prefs.push('delelott');
  if (h >= 12 && h < 14) prefs.push('kora_delutan');
  if (h >= 14 && h < 18) prefs.push('delutan');
  if (h >= 18 && h < 22) prefs.push('este');
  prefs.push('barmikor'); return prefs;
}
function daypartScore(dayparts: string[], now: Date): number {
  const norm = dayparts.map((d) => normalizeString(d).replace(/\s+/g, '_'));
  const prefs = daypartPrefs(now);
  for (let i = 0; i < prefs.length; i++) if (norm.includes(prefs[i])) return prefs.length - i;
  return 0;
}
export function computeRelevance(tea: Tea, now: Date): number {
  const seasons = toStringArray(tea.season_recommended);
  const dayparts = toStringArray(tea.daypart_recommended);
  return seasonScore(seasons, now) * 10 + daypartScore(dayparts, now);
}

const SEARCH_WEIGHTS: Record<string, number> = {
  name: 3,
  category: 2,
  subcategory: 1,
  description: 2,
  mood_short: 2,
  function: 1,
  'tag-1': 1,
  'tag-2': 1,
  'tag-3': 1,
  'ingerdient-1': 1,
  'ingerdient-2': 1,
  'ingerdient-3': 1,
  'ingerdient-4': 1,
  'ingerdient-5': 1,
  'ingerdient-6': 1,
  fullDescription: 2,
  when: 1,
  origin: 1,
};

type NormalizedTeaForHome = NormalizedTea & Tea;
type HomeNormalization = Omit<NormalizeResult, 'teas'> & { teas: NormalizedTeaForHome[] };

interface HomeProps { normalization: HomeNormalization; }

export default function Home({ normalization }: HomeProps) {
  const teas = normalization.teas;
  const [selectedTea, setSelectedTea] = useState<Tea | null>(null);
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>('relevanceDesc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showCategorySidebar, _setShowCategorySidebar] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>(() => createEmptyFilterState());
  const [shuffleSeed, setShuffleSeed] = useState<number | null>(null);

  // csak kliensen jelöljük, hogy lehet “véletlent” és időt használni
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // shuffleSeed: csak akkor változik, amikor ÚJ választékot kérsz
  const bumpSeed = useCallback(() => {
    const base = Math.floor(Math.random() * 2 ** 31);
    const poolHash = hash(teas.length + ':' + teas.map(t => t.id).join(','));
    setShuffleSeed((base ^ poolHash) >>> 0);
  }, [teas]);
  // első mountkor seed generálás
  useEffect(() => { if (mounted && shuffleSeed === null) bumpSeed(); }, [mounted, shuffleSeed, bumpSeed]);
  // ha keresel vagy kategóriát váltasz → új seed (egyszeri újrakeverés)
  useEffect(
    () => { if (mounted) bumpSeed(); /* page reset is below */ },
    [query, selectedCategories, filterState, mounted, bumpSeed],
  );

  // stabil keverés — csak kliensen és csak seedváltáskor
  const shuffledTeas = useMemo(() => {
    if (!mounted || shuffleSeed === null) return teas; // SSR: determinisztikus
    return deterministicShuffle(teas, shuffleSeed);
  }, [teas, mounted, shuffleSeed]);

  // szűrés
  const filtered: NormalizedTeaForHome[] = useMemo(() => {
    const normalizedQuery = query.trim() ? normalizeString(query.trim()) : '';
    const base = applyFilters(shuffledTeas, filterState) as NormalizedTeaForHome[];

    const categoryFiltered: NormalizedTeaForHome[] =
      selectedCategories.length === 0
        ? base
        : base.filter((t) => (t.category ? selectedCategories.includes(t.category) : false));

    if (!normalizedQuery) return categoryFiltered;

    return categoryFiltered
      .map((tea) => {
        let score = 0;
        const teaRecord = tea as unknown as Record<string, unknown>;
        for (const [field, weight] of Object.entries(SEARCH_WEIGHTS)) {
          const value = teaRecord[field];
          if (!value) continue;
          if (Array.isArray(value)) {
            if (
              value.some(
                (item) =>
                  typeof item === 'string' && normalizeString(item).includes(normalizedQuery),
              )
            ) {
              score += weight;
            }
            continue;
          }
          if (typeof value === 'string' && normalizeString(value).includes(normalizedQuery)) {
            score += weight;
          }
        }

        if (
          Array.isArray((tea as NormalizedTeaForHome).ingredients) &&
          (tea as NormalizedTeaForHome).ingredients.some((ingredient) =>
            normalizeString(ingredient).includes(normalizedQuery),
          )
        ) {
          score += 1;
        }

        return { tea, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.tea);
  }, [shuffledTeas, filterState, selectedCategories, query]);

  // rendezés
  const now = useMemo(() => (mounted ? new Date() : null), [mounted]);
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === 'nameAsc') return arr.sort((a, b) => a.name.localeCompare(b.name, 'hu', { sensitivity: 'base' }));
    if (sort === 'nameDesc') return arr.sort((a, b) => b.name.localeCompare(a.name, 'hu', { sensitivity: 'base' }));
    if (sort === 'intensityAsc' || sort === 'intensityDesc') {
      const map: Record<string, number> = { enyhe: 1, 'közepes': 2, 'erős': 3 };
      arr.sort((a, b) => (map[a.intensity || ''] || 0) - (map[b.intensity || ''] || 0));
      if (sort === 'intensityDesc') arr.reverse();
      return arr;
    }
    if (sort === 'steepMinAsc') return arr.sort((a, b) => (a.steepMin || 0) - (b.steepMin || 0));
    if (sort === 'steepMinDesc') return arr.sort((a, b) => (b.steepMin || 0) - (a.steepMin || 0));
    if (sort === 'relevanceDesc') {
      if (!now) return arr; // SSR: ne függjön az időtől
      return arr.sort((a, b) => computeRelevance(b, now) - computeRelevance(a, now));
    }
    return arr;
  }, [filtered, sort, now]);

  const { tilesX, tilesY, perPage } = useTeaGridLayout();

  const distributed = useMemo(() => {
    const seed = shuffleSeed ?? 0;
    return distributeByCategory(sorted, perPage, tilesX, seed);
  }, [sorted, perPage, tilesX, shuffleSeed]);

  const { page, totalPages, goTo } = usePagination(distributed.length, perPage, 1);

  const categories = useMemo(
    () => Array.from(new Set(teas.map((t) => t.category)))
      .sort((a, b) => a.localeCompare(b, 'hu', { sensitivity: 'base' })),
    [teas],
  );

  const dynamicData = useMemo<FilterPanelData>(() => {
    const filterWithout = (key: keyof FilterState): FilterState => {
      const cleared: FilterState = {
        ...filterState,
        focusMin: { ...filterState.focusMin },
      };

      switch (key) {
        case 'categories':
          cleared.categories = [];
          break;
        case 'subcategories':
          cleared.subcategories = [];
          break;
        case 'tastes':
          cleared.tastes = [];
          break;
        case 'focusMin':
          cleared.focusMin = {};
          break;
        case 'intensities':
          cleared.intensities = [];
          break;
        case 'caffeine':
          cleared.caffeine = [];
          break;
        case 'dayparts':
          cleared.dayparts = [];
          break;
        case 'seasons':
          cleared.seasons = [];
          break;
        case 'serve':
          cleared.serve = [];
          break;
        case 'ingredients':
          cleared.ingredients = [];
          break;
        case 'allergensExclude':
          cleared.allergensExclude = [];
          break;
        case 'methods':
          cleared.methods = [];
          break;
        default:
          break;
      }

      return cleared;
    };

    const teasByFacet = (facet: keyof FilterState) => applyFilters(teas, filterWithout(facet));

    const isNonEmptyString = (value: string | null | undefined): value is string =>
      typeof value === 'string' && value.length > 0;

    const isDefined = <T,>(value: T | null | undefined): value is T =>
      value !== null && value !== undefined;

    const availableCategories = new Set(
      teasByFacet('categories')
        .map((tea) => tea.categorySlug)
        .filter(isNonEmptyString),
    );
    const categories = normalization.categories.filter((category) => availableCategories.has(category.slug));

    const availableSubcategories = new Set(
      teasByFacet('subcategories')
        .map((tea) => tea.subcategorySlug)
        .filter(isNonEmptyString),
    );
    const subcategories = normalization.subcategories.filter((subcategory) =>
      availableSubcategories.has(subcategory.slug)
    );

    const availableTastes = new Set(
      teasByFacet('tastes').flatMap((tea) =>
        filterState.tasteMode === 'dominant' ? tea.tasteDominant : tea.tastePresent,
      ),
    );
    const tastes = normalization.tastes.filter((taste) => availableTastes.has(taste.slug));

    const availableIntensities = new Set(
      teasByFacet('intensities')
        .map((tea) => tea.intensityBucket)
        .filter(isDefined),
    );
    const intensities = normalization.intensities.filter((bucket) => availableIntensities.has(bucket));

    const availableCaffeine = new Set(
      teasByFacet('caffeine')
        .map((tea) => tea.caffeineBucket)
        .filter(isDefined),
    );
    const caffeineLevels = normalization.caffeineLevels.filter((bucket) => availableCaffeine.has(bucket));

    const availableDayparts = new Set(
      teasByFacet('dayparts')
        .flatMap((tea) => tea.daypartSlugs)
        .filter(isNonEmptyString),
    );
    const dayparts = normalization.dayparts.filter((daypart) => availableDayparts.has(daypart.slug));

    const availableSeasons = new Set(
      teasByFacet('seasons')
        .flatMap((tea) => tea.seasonSlugs)
        .filter(isNonEmptyString),
    );
    const seasons = normalization.seasons.filter((season) => availableSeasons.has(season.slug));

    const availableServe = new Set(teasByFacet('serve').flatMap((tea) => tea.serveModes));
    const serveModes = normalization.serveModes.filter((mode) => availableServe.has(mode.id));

    const availableIngredients = new Set(
      teasByFacet('ingredients')
        .flatMap((tea) => tea.ingredients)
        .filter(isNonEmptyString),
    );
    const ingredients = normalization.ingredients.filter((ingredient) => availableIngredients.has(ingredient));

    const availableAllergens = new Set(
      teasByFacet('allergensExclude')
        .flatMap((tea) => tea.allergenSlugs)
        .filter(isNonEmptyString),
    );
    const allergens = normalization.allergens.filter((allergen) => availableAllergens.has(allergen.slug));

    const methodCountMap = new Map<string, number>();
    for (const tea of teasByFacet('methods')) {
      const ids = Array.isArray((tea as any).methodIds) ? (tea as any).methodIds : [];
      for (const rawId of ids) {
        const id = typeof rawId === 'string' ? rawId.trim() : String(rawId ?? '').trim();
        if (!id) continue;
        methodCountMap.set(id, (methodCountMap.get(id) ?? 0) + 1);
      }
    }
    const methods = normalization.methods.filter(
      (method) => (methodCountMap.get(method.id) ?? 0) > 0,
    );
    const methodCounts = Object.fromEntries(methodCountMap.entries());

    return {
      categories,
      subcategories,
      tastes,
      intensities,
      caffeineLevels,
      dayparts,
      seasons,
      serveModes,
      ingredients,
      allergens,
      methods,
      methodCounts,
    };
  }, [teas, filterState, normalization]);
  
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  };

  useEffect(() => { goTo(1); }, [query, selectedCategories, sort, filterState, goTo]);

  useEffect(() => {
    const el = document.getElementById('tea-grid');
    el?.focus?.();
    window.history.replaceState(null, '', `?page=${page}`);
  }, [page]);

  useEffect(() => {
    (window as any).analytics?.track?.('page_change', { page, perPage });
  }, [page, perPage]);

  return (
    <>
      <Header
        query={query}
        onChange={setQuery}
        onOpenFilters={() => setFiltersOpen(true)}
        sort={sort}
        onChangeSort={setSort}
      />
      {showCategorySidebar && (
        <CategorySidebar categories={categories} selected={selectedCategories} onToggle={toggleCategory} />
      )}
      <FilterPanel
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filterState}
        onChange={setFilterState}
        data={dynamicData}
      />
      <TeaGrid
        items={distributed}
        page={page}
        perPage={perPage}
        onTeaClick={setSelectedTea}
        gridId="tea-grid"
        tilesX={tilesX}
        tilesY={tilesY}
      />
      <PaginationBar page={page} totalPages={totalPages} onSelect={goTo} aria-controls="tea-grid" />

      {selectedTea && <TeaModal tea={selectedTea} onClose={() => setSelectedTea(null)} />}
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const filePath = path.join(process.cwd(), 'data', 'teas.json');
  const jsonData = await fs.readFile(filePath, 'utf8');
  const rawTeas: any[] = JSON.parse(jsonData);

  const descPath = path.join(process.cwd(), 'data', 'teas_descriptions.json');
  const descData = await fs.readFile(descPath, 'utf8');
  const descList: any[] = JSON.parse(descData);
  const descMap: Record<number, any> = {};
  for (const d of descList) descMap[d.id] = d;

  const brewProfilesPath = path.join(process.cwd(), 'data', 'brew_profiles.json');
  const brewProfilesData = await fs.readFile(brewProfilesPath, 'utf8');
  const brewProfiles: BrewProfileDocument[] = JSON.parse(brewProfilesData);

  const teasWithDescriptions = rawTeas.map((t) => {
    const d = descMap[t.id] || {};
    return {
      ...t,
      season_recommended: toStringArray(t.season_recommended),
      daypart_recommended: toStringArray(t.daypart_recommended),
      fullDescription: d['főszöveg'],
      when: d['mikor'],
      origin: d['eredet'],
    };
  });

  const normalizationBase = normalizeTeas(teasWithDescriptions, { brewProfiles });
  const normalizedTeas = normalizationBase.teas.map((tea) => ({
    ...tea,
    season_recommended: toStringArray(tea.season_recommended),
    daypart_recommended: toStringArray(tea.daypart_recommended),
  })) as NormalizedTeaForHome[];

  const catMap: Record<string, NormalizedTeaForHome[]> = {};
  for (const tea of normalizedTeas) {
    const category = tea.category ?? 'Egyéb';
    (catMap[category] ||= []).push(tea);
  }

  const sorted: NormalizedTeaForHome[] = [];
  let idx = 0;
  for (const cat of Object.keys(catMap)) {
    const group = catMap[cat].sort((a, b) => Number(a.id) - Number(b.id));
    for (const t of group) {
      t.mandalaIndex = idx++;
      sorted.push(t);
    }
  }

  const normalization: HomeNormalization = {
    ...normalizationBase,
    teas: sorted,
  };

  return { props: { normalization } };
};