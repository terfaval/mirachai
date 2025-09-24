import { GetStaticProps } from 'next';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import path from 'path';
import { promises as fs } from 'fs';
import TeaGrid, { type ActiveSelection } from '../components/TeaGrid';
import Header from '../components/Header';
import { SortKey, sortOptions } from '../components/sortOptions';
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
  type FocusAxis,
} from '../lib/normalize';
import FilterPanel, { type FilterPanelData } from '../src/ui/filters/FilterPanel';
import {
  applyFilters,
  createEmptyFilterState,
  type FilterState,
  countActiveFilters,
  CAFFEINE_BUCKET_OPTIONS,
  FOCUS_AXIS_LABELS,
  INTENSITY_BUCKET_OPTIONS,
} from '../lib/tea-filters';
import { distributeByCategory } from '../utils/category-distribution';
import type { Tea as FilterTea } from '../utils/filter';
import { getMandalaPath } from '../utils/mandala';
import { getTasteIcon } from '@/utils/tasteIcons';
import { SERVE_MODE_DEFINITIONS } from '@/utils/serveModes';
import { computeRelevance, tieBreak, type Tea as RelevanceTea } from '../utils/relevance';

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

type NormalizedTeaForHome = NormalizedTea & FilterTea & RelevanceTea;
type HomeNormalization = Omit<NormalizeResult, 'teas'> & { teas: NormalizedTeaForHome[] };

interface HomeProps {
  normalization: HomeNormalization;
  seedNowISODate: string;
}

type FilterArrayKey =
  | 'categories'
  | 'subcategories'
  | 'tastes'
  | 'intensities'
  | 'caffeine'
  | 'dayparts'
  | 'seasons'
  | 'serve'
  | 'ingredients'
  | 'allergensExclude'
  | 'methods';

export default function Home({ normalization, seedNowISODate }: HomeProps) {
  const teas = normalization.teas;
  const { query: routerQuery } = useRouter();
  const [selectedTea, setSelectedTea] = useState<FilterTea | null>(null);
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>('relevanceDesc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showCategorySidebar, _setShowCategorySidebar] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>(() => createEmptyFilterState());
  const [shuffleSeed, setShuffleSeed] = useState<number | null>(null);

  const fullscreenRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(() => {
    const el = fullscreenRef.current;
    if (!el) return;
    const request: (() => Promise<void> | void) | undefined =
      el.requestFullscreen ??
      (el as any).webkitRequestFullscreen ??
      (el as any).mozRequestFullScreen ??
      (el as any).msRequestFullscreen;
    if (request) {
      try {
        const result = request.call(el);
        if (result && typeof (result as Promise<void>).catch === 'function') {
          (result as Promise<void>).catch(() => {});
        }
      } catch {
        /* nyeljük el a hibát, ha nem támogatott */
      }
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    const exit: (() => Promise<void> | void) | undefined =
      document.exitFullscreen ??
      (document as any).webkitExitFullscreen ??
      (document as any).mozCancelFullScreen ??
      (document as any).msExitFullscreen;
    if (exit) {
      try {
        const result = exit.call(document);
        if (result && typeof (result as Promise<void>).catch === 'function') {
          (result as Promise<void>).catch(() => {});
        }
      } catch {
        /* figyelmen kívül hagyjuk */
      }
    }
  }, []);

  useEffect(() => {
    const handleChange = () => {
      const fullscreenElement =
        document.fullscreenElement ??
        (document as any).webkitFullscreenElement ??
        (document as any).mozFullScreenElement ??
        (document as any).msFullscreenElement ??
        null;
      setIsFullscreen(Boolean(fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange as EventListener);
    document.addEventListener('mozfullscreenchange', handleChange as EventListener);
    document.addEventListener('MSFullscreenChange', handleChange as EventListener);
    handleChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange as EventListener);
      document.removeEventListener('mozfullscreenchange', handleChange as EventListener);
      document.removeEventListener('MSFullscreenChange', handleChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (filtersOpen) return;
        if (isFullscreen) {
          exitFullscreen();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filtersOpen, isFullscreen, exitFullscreen]);
  
  const hourLocal = useMemo(() => {
    if (typeof routerQuery.hour === 'string') {
      const h = Number(routerQuery.hour);
      if (!Number.isNaN(h)) return Math.max(0, Math.min(23, h));
    }
    return new Date().getHours();
  }, [routerQuery.hour]);

  const clearSort = useCallback(() => setSort('relevanceDesc'), [setSort]);

  const removeFromFilterArray = useCallback(
    <K extends FilterArrayKey>(key: K, value: FilterState[K][number]) => {
      setFilterState(prev => {
        const current = prev[key];
        const next = current.filter(item => item !== value) as FilterState[K];
        if (next.length === current.length) return prev;
        return { ...prev, [key]: next };
      });
    },
    [setFilterState],
  );

  const clearFocusAxis = useCallback(
    (axis: FocusAxis) => {
      setFilterState(prev => {
        if (prev.focusMin[axis] === undefined) return prev;
        const nextFocus = { ...prev.focusMin };
        delete nextFocus[axis];
        return { ...prev, focusMin: nextFocus };
      });
    },
    [setFilterState],
  );

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
  const relevanceSorted = useMemo(() => {
    const ctx = { seedISODate: seedNowISODate, hourLocal };
    const sorted = filtered.slice().sort((a, b) => {
      const ar = computeRelevance(a, ctx);
      const br = computeRelevance(b, ctx);
      return ar !== br ? br - ar : tieBreak(a, b);
    });
    return sorted;
  }, [filtered, seedNowISODate, hourLocal]);

  const sorted = useMemo(() => {
    if (sort === 'nameAsc') {
      return [...filtered].sort((a, b) => {
        const cmp = (a.name || '').localeCompare(b.name || '', 'hu', { sensitivity: 'base' });
        return cmp !== 0 ? cmp : a.id - b.id;
      });
    }
    if (sort === 'nameDesc') {
      return [...filtered].sort((a, b) => {
        const cmp = (b.name || '').localeCompare(a.name || '', 'hu', { sensitivity: 'base' });
        return cmp !== 0 ? cmp : a.id - b.id;
      });
    }
    if (sort === 'intensityAsc' || sort === 'intensityDesc') {
      const map: Record<string, number> = { enyhe: 1, 'közepes': 2, 'erős': 3 };
      const compareAsc = (a: NormalizedTeaForHome, b: NormalizedTeaForHome) => {
        const av = map[a.intensity || ''] || 0;
        const bv = map[b.intensity || ''] || 0;
        if (av !== bv) return av - bv;
        return tieBreak(a, b);
      };
      if (sort === 'intensityAsc') {
        return [...filtered].sort(compareAsc);
      }
      return [...filtered].sort((a, b) => {
        const av = map[a.intensity || ''] || 0;
        const bv = map[b.intensity || ''] || 0;
        if (av !== bv) return bv - av;
        return tieBreak(a, b);
      });
    }
    if (sort === 'steepMinAsc') {
      return [...filtered].sort((a, b) => {
        const av = a.steepMin ?? Number.POSITIVE_INFINITY;
        const bv = b.steepMin ?? Number.POSITIVE_INFINITY;
        if (av !== bv) return av - bv;
        return tieBreak(a, b);
      });
    }
    if (sort === 'steepMinDesc') {
      return [...filtered].sort((a, b) => {
        const av = a.steepMin ?? Number.NEGATIVE_INFINITY;
        const bv = b.steepMin ?? Number.NEGATIVE_INFINITY;
        if (av !== bv) return bv - av;
        return tieBreak(a, b);
      });
    }
    if (sort === 'relevanceDesc') {
      return relevanceSorted;
    }
    return [...filtered];
  }, [filtered, sort, relevanceSorted]);

  const { tilesX, tilesY, perPage } = useTeaGridLayout();

  const distributed = useMemo(() => {
    if (!shuffleSeed || sort !== 'relevanceDesc') return sorted;
    return distributeByCategory(sorted, perPage, tilesX, shuffleSeed);
  }, [sorted, perPage, tilesX, shuffleSeed, sort]);

  const { page, totalPages, goTo } = usePagination(distributed.length, perPage, 1);

  const activeFilterCount = useMemo(() => countActiveFilters(filterState), [filterState]);

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

  const categoryLabels = useMemo(
    () => new Map(normalization.categories.map((category) => [category.slug, category.label])),
    [normalization.categories],
  );
  const subcategoryLabels = useMemo(
    () =>
      new Map(normalization.subcategories.map((subcategory) => [subcategory.slug, subcategory.label])),
    [normalization.subcategories],
  );
  const tasteLabels = useMemo(
    () => new Map(normalization.tastes.map((taste) => [taste.slug, taste.label])),
    [normalization.tastes],
  );
  const daypartLabels = useMemo(
    () => new Map(normalization.dayparts.map((daypart) => [daypart.slug, daypart.label])),
    [normalization.dayparts],
  );
  const seasonLabels = useMemo(
    () => new Map(normalization.seasons.map((season) => [season.slug, season.label])),
    [normalization.seasons],
  );
  const serveLabels = useMemo(
    () => new Map(normalization.serveModes.map((mode) => [mode.id, mode.label])),
    [normalization.serveModes],
  );
  const allergenLabels = useMemo(
    () => new Map(normalization.allergens.map((allergen) => [allergen.slug, allergen.label])),
    [normalization.allergens],
  );
  const methodLabels = useMemo(
    () => new Map(normalization.methods.map((method) => [method.id, method.label])),
    [normalization.methods],
  );
  const intensityLabels = useMemo(() => {
    const map = new Map<string, string>();
    INTENSITY_BUCKET_OPTIONS.forEach((option) => map.set(option.id, option.label));
    return map;
  }, []);
  const caffeineLabels = useMemo(() => {
    const map = new Map<string, string>();
    CAFFEINE_BUCKET_OPTIONS.forEach((option) => map.set(option.id, option.label));
    return map;
  }, []);
  const activeSortOption = useMemo(() => sortOptions.find((option) => option.key === sort), [sort]);

  const activeSelections = useMemo<ActiveSelection[]>(() => {
    const chips: ActiveSelection[] = [];

    if (sort !== 'relevanceDesc') {
      chips.push({
        id: `sort-${sort}`,
        label: activeSortOption?.label ?? 'Rendezés',
        icon: '/icons/sort.svg',
        onRemove: clearSort,
      });
    }

    for (const slug of filterState.categories) {
      const label = categoryLabels.get(slug) ?? slug;
      chips.push({
        id: `category-${slug}`,
        label: `Kategória: ${label}`,
        icon: getMandalaPath(label),
        onRemove: () => removeFromFilterArray('categories', slug),
      });
    }

    for (const slug of filterState.subcategories) {
      const label = subcategoryLabels.get(slug) ?? slug;
      chips.push({
        id: `subcategory-${slug}`,
        label: `Alkategória: ${label}`,
        onRemove: () => removeFromFilterArray('subcategories', slug),
      });
    }

    const tastePrefix = filterState.tasteMode === 'dominant' ? 'Domináns íz' : 'Íz';
    for (const slug of filterState.tastes) {
      const label = tasteLabels.get(slug) ?? slug;
      chips.push({
        id: `taste-${slug}`,
        label: `${tastePrefix}: ${label}`,
        icon: getTasteIcon(slug),
        onRemove: () => removeFromFilterArray('tastes', slug),
      });
    }

    Object.entries(filterState.focusMin).forEach(([axisKey, level]) => {
      const axis = axisKey as FocusAxis;
      if (!level || level <= 0) return;
      const axisLabel = FOCUS_AXIS_LABELS[axis] ?? axis;
      chips.push({
        id: `focus-${axis}`,
        label: `Fókusz – ${axisLabel} ≥ ${level}`,
        icon: '/icons/icon_info.svg',
        onRemove: () => clearFocusAxis(axis),
      });
    });

    for (const bucket of filterState.intensities) {
      const label = intensityLabels.get(bucket) ?? bucket;
      chips.push({
        id: `intensity-${bucket}`,
        label: `Intenzitás: ${label}`,
        onRemove: () => removeFromFilterArray('intensities', bucket),
      });
    }

    for (const level of filterState.caffeine) {
      const label = caffeineLabels.get(level) ?? level;
      chips.push({
        id: `caffeine-${level}`,
        label: `Koffein: ${label}`,
        onRemove: () => removeFromFilterArray('caffeine', level),
      });
    }

    for (const slug of filterState.dayparts) {
      const label = daypartLabels.get(slug) ?? slug;
      chips.push({
        id: `daypart-${slug}`,
        label: `Napszak: ${label}`,
        onRemove: () => removeFromFilterArray('dayparts', slug),
      });
    }

    for (const slug of filterState.seasons) {
      const label = seasonLabels.get(slug) ?? slug;
      chips.push({
        id: `season-${slug}`,
        label: `Évszak: ${label}`,
        onRemove: () => removeFromFilterArray('seasons', slug),
      });
    }

    for (const mode of filterState.serve) {
      const label = serveLabels.get(mode) ?? mode;
      const meta = SERVE_MODE_DEFINITIONS[mode];
      chips.push({
        id: `serve-${mode}`,
        label: `Szervírozás: ${label}`,
        icon: meta?.icon,
        onRemove: () => removeFromFilterArray('serve', mode),
      });
    }

    for (const ingredient of filterState.ingredients) {
      const base = ingredient.replace(/_/g, ' ');
      const label = base.charAt(0).toUpperCase() + base.slice(1);
      chips.push({
        id: `ingredient-${ingredient}`,
        label: `Összetevő: ${label}`,
        onRemove: () => removeFromFilterArray('ingredients', ingredient),
      });
    }

    for (const slug of filterState.allergensExclude) {
      const label = allergenLabels.get(slug) ?? slug;
      chips.push({
        id: `allergen-${slug}`,
        label: `Allergén nélkül: ${label}`,
        onRemove: () => removeFromFilterArray('allergensExclude', slug),
      });
    }

    for (const id of filterState.methods) {
      const label = methodLabels.get(id) ?? id;
      chips.push({
        id: `method-${id}`,
        label: `Metódus: ${label}`,
        onRemove: () => removeFromFilterArray('methods', id),
      });
    }

    return chips;
  }, [
    sort,
    activeSortOption,
    filterState,
    categoryLabels,
    subcategoryLabels,
    tasteLabels,
    daypartLabels,
    seasonLabels,
    serveLabels,
    allergenLabels,
    methodLabels,
    intensityLabels,
    caffeineLabels,
    clearSort,
    removeFromFilterArray,
    clearFocusAxis,
  ]);
  
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
    <div ref={fullscreenRef} className="relative min-h-screen">
      <Header />
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
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onChangeSort={setSort}
        onOpenFilters={() => setFiltersOpen(true)}
        activeFilterCount={activeFilterCount}
        activeSelections={activeSelections}
        onEnterFullscreen={enterFullscreen}
        isFullscreen={isFullscreen}
      />
      <PaginationBar page={page} totalPages={totalPages} onSelect={goTo} aria-controls="tea-grid" />

      {selectedTea && <TeaModal tea={selectedTea} onClose={() => setSelectedTea(null)} />}
      {isFullscreen && (
        <button
          type="button"
          onClick={exitFullscreen}
          className="fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-full border border-white/80 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-lg transition hover:bg-white/90"
          aria-label="Kilépés a teljes képernyőből"
        >
          <span aria-hidden className="text-lg leading-none">×</span>
          <span>Kilépés</span>
        </button>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const seedNowISODate = new Date().toISOString().slice(0, 10);
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

  return { props: { normalization, seedNowISODate } };
};