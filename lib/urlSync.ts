import { FOCUS_AXES, type FocusAxis } from "./normalize";
import {
  DEFAULT_FILTER_STATE,
  createEmptyFilterState,
  type FilterState
} from "./tea-filters";

const QUERY_KEYS = {
  categories: "cat",
  subcategories: "sub",
  tastes: "taste",
  tasteMode: "tmode",
  focus: "foc",
  intensities: "int",
  caffeine: "caf",
  dayparts: "day",
  seasons: "sea",
  serve: "srv",
  ingredients: "ing",
  allergens: "all",
  methods: "met"
} as const;

function decodeList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map(token => token.trim())
    .filter(Boolean);
}

function encodeList(values: string[]): string | undefined {
  if (!values.length) return undefined;
  return Array.from(new Set(values)).join(",");
}

function encodeFocusMin(focusMin: FilterState["focusMin"]): string | undefined {
  const parts: string[] = [];
  for (const axis of FOCUS_AXES) {
    const value = focusMin[axis];
    if (value !== undefined && value > 0) {
      parts.push(`${axis}:${Math.min(3, Math.max(0, Math.round(value)))}`);
    }
  }
  return parts.length ? parts.join("|") : undefined;
}

function decodeFocusMin(value: string | null): FilterState["focusMin"] {
  const focus: FilterState["focusMin"] = {};
  if (!value) return focus;
  for (const part of value.split("|")) {
    const [axisRaw, numRaw] = part.split(":");
    if (!axisRaw || !numRaw) continue;
    const axis = axisRaw as FocusAxis;
    if (!FOCUS_AXES.includes(axis)) continue;
    const num = Number(numRaw);
    if (!Number.isFinite(num) || num <= 0) continue;
    focus[axis] = Math.min(3, Math.max(0, Math.round(num)));
  }
  return focus;
}

export function filtersToParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();

  const categories = encodeList(filters.categories);
  if (categories) params.set(QUERY_KEYS.categories, categories);

  const subcategories = encodeList(filters.subcategories);
  if (subcategories) params.set(QUERY_KEYS.subcategories, subcategories);

  const tastes = encodeList(filters.tastes);
  if (tastes) params.set(QUERY_KEYS.tastes, tastes);

  if (filters.tasteMode !== DEFAULT_FILTER_STATE.tasteMode) {
    params.set(QUERY_KEYS.tasteMode, filters.tasteMode);
  }

  const focus = encodeFocusMin(filters.focusMin);
  if (focus) params.set(QUERY_KEYS.focus, focus);

  const intensities = encodeList(filters.intensities);
  if (intensities) params.set(QUERY_KEYS.intensities, intensities);

  const caffeine = encodeList(filters.caffeine);
  if (caffeine) params.set(QUERY_KEYS.caffeine, caffeine);

  const dayparts = encodeList(filters.dayparts);
  if (dayparts) params.set(QUERY_KEYS.dayparts, dayparts);

  const seasons = encodeList(filters.seasons);
  if (seasons) params.set(QUERY_KEYS.seasons, seasons);

  const serve = encodeList(filters.serve);
  if (serve) params.set(QUERY_KEYS.serve, serve);

  const ingredients = encodeList(filters.ingredients);
  if (ingredients) params.set(QUERY_KEYS.ingredients, ingredients);

  const allergens = encodeList(filters.allergensExclude);
  if (allergens) params.set(QUERY_KEYS.allergens, allergens);

  const methods = encodeList(filters.methods);
  if (methods) params.set(QUERY_KEYS.methods, methods);

  return params;
}

export function filtersToSearch(filters: FilterState): string {
  const query = filtersToParams(filters).toString();
  return query ? `?${query}` : "";
}

export function parseFiltersFromSearch(search?: string | null): FilterState {
  const params = new URLSearchParams(search ?? "");
  const next = createEmptyFilterState();

  const categories = decodeList(params.get(QUERY_KEYS.categories));
  if (categories.length) next.categories = categories;

  const subcategories = decodeList(params.get(QUERY_KEYS.subcategories));
  if (subcategories.length) next.subcategories = subcategories;

  const tastes = decodeList(params.get(QUERY_KEYS.tastes));
  if (tastes.length) next.tastes = tastes;

  const tasteMode = params.get(QUERY_KEYS.tasteMode);
  if (tasteMode === "present" || tasteMode === "dominant") {
    next.tasteMode = tasteMode;
  }

  const focus = decodeFocusMin(params.get(QUERY_KEYS.focus));
  if (Object.keys(focus).length) {
    next.focusMin = focus;
  }

  const intensities = decodeList(params.get(QUERY_KEYS.intensities));
  if (intensities.length) next.intensities = intensities as FilterState["intensities"];

  const caffeine = decodeList(params.get(QUERY_KEYS.caffeine));
  if (caffeine.length) next.caffeine = caffeine as FilterState["caffeine"];

  const dayparts = decodeList(params.get(QUERY_KEYS.dayparts));
  if (dayparts.length) next.dayparts = dayparts;

  const seasons = decodeList(params.get(QUERY_KEYS.seasons));
  if (seasons.length) next.seasons = seasons;

  const serve = decodeList(params.get(QUERY_KEYS.serve));
  if (serve.length) next.serve = serve as FilterState["serve"];

  const ingredients = decodeList(params.get(QUERY_KEYS.ingredients));
  if (ingredients.length) next.ingredients = ingredients;

  const allergens = decodeList(params.get(QUERY_KEYS.allergens));
  if (allergens.length) next.allergensExclude = allergens;

  const methods = decodeList(params.get(QUERY_KEYS.methods));
  if (methods.length) next.methods = methods;

  return next;
}

export function updateUrlWithFilters(filters: FilterState) {
  if (typeof window === "undefined") return;
  const search = filtersToSearch(filters);
  const hash = window.location.hash ?? "";
  const next = `${window.location.pathname}${search}${hash}`;
  window.history.replaceState(null, "", next);
}
