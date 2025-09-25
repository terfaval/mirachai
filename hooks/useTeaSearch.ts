'use client';

import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';

import {
  applyFilters,
  countActiveFilters,
  createEmptyFilterState,
  type FilterState,
} from '@/lib/search/filtering';
import { normalizeString, SEARCH_WEIGHTS } from '@/lib/search/normalizeString';
import { paginate } from '@/lib/search/paginate';
import { deterministicShuffle, hashString } from '@/lib/rng/deterministic';
import { sortTeas, type SortKey, type SortableTea } from '@/lib/search/sort';
import type { NormalizedTea } from '@/lib/normalize';

export type UseTeaSearchOptions<T extends SortableTea & NormalizedTea> = {
  teas: T[];
  pageSize: number;
  computeRelevance: (tea: T) => number;
  tieBreak: (a: T, b: T) => number;
  transformBeforePagination?: (
    items: T[],
    context: { sort: SortKey; shuffleSeed: number | null; pageSize: number },
  ) => T[];
};

export type UseTeaSearchResult<T extends SortableTea & NormalizedTea> = {
  query: string;
  setQuery: (value: string) => void;
  sort: SortKey;
  setSort: (key: SortKey) => void;
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  page: number;
  setPage: (page: number) => void;
  filtered: T[];
  sorted: T[];
  relevanceSorted: T[];
  displayList: T[];
  paginated: T[];
  pageCount: number;
  activeFilterCount: number;
  shuffleSeed: number | null;
  bumpShuffleSeed: () => void;
};

export function useTeaSearch<T extends SortableTea & NormalizedTea>({
  teas,
  pageSize,
  computeRelevance,
  tieBreak,
  transformBeforePagination,
}: UseTeaSearchOptions<T>): UseTeaSearchResult<T> {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('relevanceDesc');
  const [filters, setFilters] = useState<FilterState>(() => createEmptyFilterState());
  const [page, setPage] = useState(1);
  const [shuffleSeed, setShuffleSeed] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const bumpShuffleSeed = useCallback(() => {
    const base = Math.floor(Math.random() * 2 ** 31);
    const poolHash = hashString(`${teas.length}:${teas.map(t => t.id).join(',')}`);
    setShuffleSeed((base ^ poolHash) >>> 0);
  }, [teas]);

  useEffect(() => {
    if (!mounted || shuffleSeed !== null) {
      return;
    }
    bumpShuffleSeed();
  }, [mounted, shuffleSeed, bumpShuffleSeed]);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    bumpShuffleSeed();
  }, [query, filters, mounted, bumpShuffleSeed]);

  // 1) shuffled – NE adjunk generic paramot a useMemo-nak; a végén cast T[]-re
const shuffled = useMemo(() => {
  if (!mounted || shuffleSeed === null) return teas;
  return deterministicShuffle(teas, shuffleSeed);
}, [teas, mounted, shuffleSeed]) as T[];

// 2) filtered – NE adjunk <T>-et az applyFilters-nek; a base-t castoljuk T[]-re
const filtered = useMemo(() => {
  const normalizedQuery = query.trim() ? normalizeString(query.trim()) : '';
  const base = applyFilters(shuffled, filters) as T[];  // <- fontos
  if (!normalizedQuery) return base;

  return base
    .map(tea => {
      let score = 0;
      const record = tea as unknown as Record<string, unknown>;
      for (const [field, weight] of Object.entries(SEARCH_WEIGHTS)) {
        const value = record[field];
        if (!value) continue;
        if (Array.isArray(value)) {
          if (value.some(item => typeof item === 'string' && normalizeString(item).includes(normalizedQuery))) {
            score += weight;
          }
          continue;
        }
        if (typeof value === 'string' && normalizeString(value).includes(normalizedQuery)) {
          score += weight;
        }
      }
      if (
        Array.isArray((tea as any).ingredients) &&
        (tea as any).ingredients.some((ingredient: string) => normalizeString(ingredient).includes(normalizedQuery))
      ) {
        score += 1;
      }
      return { tea, score };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.tea as T);
}, [shuffled, filters, query]) as T[];

// 3) relevanceSorted – maradhat, de adj egy T[] castot a végére a nyugalom kedvéért
const relevanceSorted = useMemo(() => {
  return filtered.slice().sort((a, b) => {
    const ar = computeRelevance(a);
    const br = computeRelevance(b);
    if (ar !== br) return br - ar;
    return tieBreak(a, b);
  });
}, [filtered, computeRelevance, tieBreak]) as T[];

// 4) sorted – NE add meg a <T>-et, a visszatérőt castold T[]-re
const sorted = useMemo(() => {
  return sortTeas({ items: filtered, key: sort, relevanceSorted, tieBreak });
}, [filtered, sort, relevanceSorted, tieBreak]) as T[];

// 5) displayList – a végén T[] cast
const displayList = useMemo(() => {
  if (!transformBeforePagination) return sorted;
  return transformBeforePagination(sorted, { sort, shuffleSeed, pageSize });
}, [sorted, transformBeforePagination, sort, shuffleSeed, pageSize]) as T[];

// 6) paginate – ha a generikus nem kell, maradhat simán, de ha panaszkodik:
const { items: paginated, pageCount } = useMemo(() => {
  return paginate(displayList, { page, size: pageSize });
}, [displayList, page, pageSize]);


  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  useEffect(() => {
    setPage(1);
  }, [query, sort, filters]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  return {
    query,
    setQuery,
    sort,
    setSort,
    filters,
    setFilters,
    page,
    setPage,
    filtered,
    sorted,
    relevanceSorted,
    displayList,
    paginated,
    pageCount,
    activeFilterCount,
    shuffleSeed,
    bumpShuffleSeed,
  };
}