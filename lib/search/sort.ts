import type { RelevanceTea } from '@/lib/search/filtering';

export type SortKey =
  | 'relevanceDesc'
  | 'nameAsc'
  | 'nameDesc'
  | 'intensityAsc'
  | 'intensityDesc'
  | 'steepMinAsc'
  | 'steepMinDesc';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'relevanceDesc', label: 'A leginkább releváns teák elől' },
  { key: 'nameAsc', label: 'Teák A-tól Z-ig' },
  { key: 'nameDesc', label: 'Teák Z-től A-ig' },
  { key: 'intensityAsc', label: 'A legkevésbé intenzív teák elől' },
  { key: 'intensityDesc', label: 'A leginkább intenzív teák elől' },
  { key: 'steepMinAsc', label: 'A leggyorsabb teák elől' },
  { key: 'steepMinDesc', label: 'A leglassabb teák elől' },
];

export type SortableTea = {
  id: number | string;
  name?: string | null;
  intensity?: string | null;
  steepMin?: number | null;
} & Partial<RelevanceTea>;

export type SortOptions<T extends SortableTea> = {
  items: readonly T[];
  key: SortKey;
  tieBreak?: (a: T, b: T) => number;
  relevanceSorted?: readonly T[];
};

const INTENSITY_ORDER: Record<string, number> = { enyhe: 1, 'közepes': 2, 'erős': 3 };

export function sortTeas<T extends SortableTea>({ items, key, tieBreak, relevanceSorted }: SortOptions<T>): T[] {
  const list = [...items];
  switch (key) {
    case 'nameAsc':
      return list.sort((a, b) => compareName(a, b) || tieBreak?.(a, b) || 0);
    case 'nameDesc':
      return list.sort((a, b) => compareName(b, a) || tieBreak?.(a, b) || 0);
    case 'intensityAsc':
      return list.sort((a, b) => compareIntensity(a, b) || tieBreak?.(a, b) || 0);
    case 'intensityDesc':
      return list.sort((a, b) => compareIntensity(b, a) || tieBreak?.(a, b) || 0);
    case 'steepMinAsc':
      return list.sort((a, b) => compareSteepMin(a, b) || tieBreak?.(a, b) || 0);
    case 'steepMinDesc':
      return list.sort((a, b) => compareSteepMin(b, a) || tieBreak?.(a, b) || 0);
    case 'relevanceDesc':
    default:
      return relevanceSorted ? [...relevanceSorted] : list;
  }
}

function compareName(a: SortableTea, b: SortableTea) {
  const an = a.name ?? '';
  const bn = b.name ?? '';
  return an.localeCompare(bn, 'hu', { sensitivity: 'base' });
}

function compareIntensity(a: SortableTea, b: SortableTea) {
  const av = INTENSITY_ORDER[a.intensity ?? ''] ?? 0;
  const bv = INTENSITY_ORDER[b.intensity ?? ''] ?? 0;
  if (av !== bv) {
    return av - bv;
  }
  return 0;
}

function compareSteepMin(a: SortableTea, b: SortableTea) {
  const av = a.steepMin ?? Number.POSITIVE_INFINITY;
  const bv = b.steepMin ?? Number.POSITIVE_INFINITY;
  if (av !== bv) {
    return av - bv;
  }
  return 0;
}