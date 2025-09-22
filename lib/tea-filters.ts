import {
  type CaffeineBucket,
  type IntensityBucket,
  type NormalizedTea,
  type ServeMode,
  type TasteMode,
  type FocusAxis,
  CAFFEINE_BUCKETS,
  FOCUS_AXES,
  INTENSITY_BUCKETS
} from "./normalize";

export type FilterState = {
  categories: string[];
  subcategories: string[];
  tastes: string[];
  tasteMode: TasteMode;
  focusMin: Partial<Record<FocusAxis, number>>;
  intensities: IntensityBucket[];
  caffeine: CaffeineBucket[];
  dayparts: string[];
  seasons: string[];
  serve: ServeMode[];
  ingredients: string[];
  allergensExclude: string[];
  methods: string[];
};

export function createEmptyFilterState(): FilterState {
  return {
    categories: [],
    subcategories: [],
    tastes: [],
    tasteMode: "present",
    focusMin: {},
    intensities: [],
    caffeine: [],
    dayparts: [],
    seasons: [],
    serve: [],
    ingredients: [],
    allergensExclude: [],
    methods: []
  };
}

export const DEFAULT_FILTER_STATE: FilterState = createEmptyFilterState();

export const TASTE_MODE_OPTIONS: { id: TasteMode; label: string }[] = [
  { id: "present", label: "Jelen van (≥1)" },
  { id: "dominant", label: "Domináns (≥2)" }
];

export const INTENSITY_BUCKET_OPTIONS: { id: IntensityBucket; label: string }[] = INTENSITY_BUCKETS.map(
  id => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) })
);

export const CAFFEINE_BUCKET_OPTIONS: { id: CaffeineBucket; label: string }[] = CAFFEINE_BUCKETS.map(
  id => ({ id, label: id.charAt(0).toUpperCase() + id.slice(1) })
);

export const FOCUS_AXIS_LABELS: Record<FocusAxis, string> = {
  immunity: "Immunitás",
  relax: "Relax",
  focus: "Fókusz",
  detox: "Detox"
};

export function applyFilters(teas: NormalizedTea[], filters: FilterState): NormalizedTea[] {
  return teas.filter(tea => {
    if (filters.categories.length) {
      if (!tea.categorySlug || !filters.categories.includes(tea.categorySlug)) {
        return false;
      }
    }

    if (filters.subcategories.length) {
      if (!tea.subcategorySlug || !filters.subcategories.includes(tea.subcategorySlug)) {
        return false;
      }
    }

    if (filters.tastes.length) {
      const source = filters.tasteMode === "dominant" ? tea.tasteDominant : tea.tastePresent;
      if (!source.length || !filters.tastes.some(taste => source.includes(taste))) {
        return false;
      }
    }

    for (const axis of FOCUS_AXES) {
      const threshold = filters.focusMin[axis];
      if (threshold !== undefined && threshold > 0) {
        const value = tea.focusValues[axis] ?? 0;
        if (value < threshold) {
          return false;
        }
      }
    }

    if (filters.intensities.length) {
      if (!tea.intensityBucket || !filters.intensities.includes(tea.intensityBucket)) {
        return false;
      }
    }

    if (filters.caffeine.length) {
      if (!tea.caffeineBucket || !filters.caffeine.includes(tea.caffeineBucket)) {
        return false;
      }
    }

    if (filters.dayparts.length) {
      if (!tea.daypartSlugs.some(token => filters.dayparts.includes(token))) {
        return false;
      }
    }

    if (filters.seasons.length) {
      if (!tea.seasonSlugs.some(token => filters.seasons.includes(token))) {
        return false;
      }
    }

    if (filters.serve.length) {
      if (!filters.serve.some(mode => tea.serveModes.includes(mode))) {
        return false;
      }
    }

    if (filters.ingredients.length) {
      if (!filters.ingredients.some(ingredient => tea.ingredients.includes(ingredient))) {
        return false;
      }
    }

    if (filters.allergensExclude.length) {
      if (tea.allergenSlugs.some(slug => filters.allergensExclude.includes(slug))) {
        return false;
      }
    }

    if (filters.methods.length) {
      if (!tea.methodIds.some(id => filters.methods.includes(id))) {
        return false;
      }
    }

    return true;
  });
}

export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.categories.length > 0 ||
    filters.subcategories.length > 0 ||
    filters.tastes.length > 0 ||
    Object.values(filters.focusMin).some(value => value !== undefined && value > 0) ||
    filters.intensities.length > 0 ||
    filters.caffeine.length > 0 ||
    filters.dayparts.length > 0 ||
    filters.seasons.length > 0 ||
    filters.serve.length > 0 ||
    filters.ingredients.length > 0 ||
    filters.allergensExclude.length > 0 ||
    filters.methods.length > 0
  );
}
