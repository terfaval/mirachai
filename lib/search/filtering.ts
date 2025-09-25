export {
  applyFilters,
  createEmptyFilterState,
  countActiveFilters,
  hasActiveFilters,
  DEFAULT_FILTER_STATE,
  type FilterState,
  TASTE_MODE_OPTIONS,
  INTENSITY_BUCKET_OPTIONS,
  CAFFEINE_BUCKET_OPTIONS,
  FOCUS_AXIS_LABELS,
} from '@/lib/tea-filters';

export {
  computeRelevance,
  tieBreak,
  type RelevanceCtx,
  type Tea as RelevanceTea,
} from '@/lib/search/relevance';