"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import teasJson from "../../data/teas.json";
import brewProfilesJson from "../../data/brew_profiles.json";
import { validateBrewProfiles } from "@/lib/brew.profileUtils";
import FilterPanel from "./filters/FilterPanel";
import {
  type NormalizeResult,
  type RawTea,
  type BrewProfileDocument,
  normalizeTeas
} from "../../lib/normalize";
import {
  applyFilters,
  createEmptyFilterState,
  hasActiveFilters,
  type FilterState
} from "../../lib/tea-filters";
import { parseFiltersFromSearch, updateUrlWithFilters } from "../../lib/urlSync";
import { FOCUS_AXES } from "../../lib/normalize";

type Props = {
  teas?: RawTea[];
  brewProfiles?: BrewProfileDocument[];
};

const arrayEqual = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((val, index) => val === b[index]);

const filtersEqual = (a: FilterState, b: FilterState) =>
  arrayEqual(a.categories, b.categories) &&
  arrayEqual(a.subcategories, b.subcategories) &&
  arrayEqual(a.tastes, b.tastes) &&
  a.tasteMode === b.tasteMode &&
  FOCUS_AXES.every(axis => (a.focusMin[axis] ?? 0) === (b.focusMin[axis] ?? 0)) &&
  arrayEqual(a.intensities, b.intensities) &&
  arrayEqual(a.caffeine, b.caffeine) &&
  arrayEqual(a.dayparts, b.dayparts) &&
  arrayEqual(a.seasons, b.seasons) &&
  arrayEqual(a.serve, b.serve) &&
  arrayEqual(a.ingredients, b.ingredients) &&
  arrayEqual(a.allergensExclude, b.allergensExclude) &&
  arrayEqual(a.methods, b.methods);

const filterUnique = <T extends string>(values: readonly T[], allowed: Set<T>): T[] => {
  const result: T[] = [];
  const seen = new Set<T>();
  values.forEach(value => {
    if (!allowed.has(value) || seen.has(value)) return;
    seen.add(value);
    result.push(value);
  });
  return result;
};

const defaultTeas = teasJson as RawTea[];
const defaultBrewProfiles = brewProfilesJson as BrewProfileDocument[];

validateBrewProfiles(defaultBrewProfiles, "src/ui/TeaSearchWithFilters.tsx");

export default function TeaSearchWithFilters({ teas, brewProfiles }: Props) {
  const teaSource = teas ?? defaultTeas;
  const brewSource = brewProfiles ?? defaultBrewProfiles;

  const normalization = useMemo<NormalizeResult>(
    () => normalizeTeas(teaSource, { brewProfiles: brewSource }),
    [teaSource, brewSource]
  );

  const optionSets = useMemo(() => {
    return {
      categories: new Set(normalization.categories.map(option => option.slug)),
      subcategories: new Set(normalization.subcategories.map(option => option.slug)),
      tastes: new Set(normalization.tastes.map(option => option.slug)),
      intensities: new Set(normalization.intensities),
      caffeine: new Set(normalization.caffeineLevels),
      dayparts: new Set(normalization.dayparts.map(option => option.slug)),
      seasons: new Set(normalization.seasons.map(option => option.slug)),
      serve: new Set(normalization.serveModes.map(option => option.id)),
      ingredients: new Set(normalization.ingredients),
      allergens: new Set(normalization.allergens.map(option => option.slug)),
      methods: new Set(normalization.methods.map(option => option.id))
    } as const;
  }, [normalization]);

  const [filters, setFilters] = useState<FilterState>(() => createEmptyFilterState());
  const [open, setOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const sanitizeFilters = useCallback(
    (next: FilterState): FilterState => {
      const sanitized = createEmptyFilterState();
      sanitized.tasteMode = next.tasteMode;

      sanitized.categories = filterUnique(next.categories, optionSets.categories);
      sanitized.subcategories = filterUnique(next.subcategories, optionSets.subcategories);
      sanitized.tastes = filterUnique(next.tastes, optionSets.tastes);
      sanitized.intensities = filterUnique(next.intensities, optionSets.intensities);
      sanitized.caffeine = filterUnique(next.caffeine, optionSets.caffeine);
      sanitized.dayparts = filterUnique(next.dayparts, optionSets.dayparts);
      sanitized.seasons = filterUnique(next.seasons, optionSets.seasons);
      sanitized.serve = filterUnique(next.serve, optionSets.serve);
      const normalizedIngredients = next.ingredients
        .map(value => value.trim().toLowerCase())
        .filter(value => optionSets.ingredients.has(value));
      sanitized.ingredients = filterUnique(normalizedIngredients, optionSets.ingredients);
      sanitized.allergensExclude = filterUnique(next.allergensExclude, optionSets.allergens);
      sanitized.methods = filterUnique(next.methods, optionSets.methods);

      const focusMin: FilterState["focusMin"] = {};
      for (const axis of FOCUS_AXES) {
        const value = next.focusMin[axis];
        if (value !== undefined && value > 0) {
          focusMin[axis] = Math.min(3, Math.max(0, Math.round(value)));
        }
      }
      sanitized.focusMin = focusMin;

      if (sanitized.tasteMode !== "present" && sanitized.tasteMode !== "dominant") {
        sanitized.tasteMode = "present";
      }

      return sanitized;
    },
    [optionSets]
  );

  useEffect(() => {
    if (initialized) return;
    const parsed = parseFiltersFromSearch(typeof window === "undefined" ? "" : window.location.search);
    const sanitized = sanitizeFilters(parsed);
    setFilters(sanitized);
    setInitialized(true);
  }, [initialized, sanitizeFilters]);

  useEffect(() => {
    if (!initialized) return;
    setFilters(prev => {
      const sanitized = sanitizeFilters(prev);
      return filtersEqual(prev, sanitized) ? prev : sanitized;
    });
  }, [sanitizeFilters, initialized]);

  useEffect(() => {
    if (!initialized) return;
    updateUrlWithFilters(filters);
  }, [filters, initialized]);

  const filteredTeas = useMemo(() => applyFilters(normalization.teas, filters), [normalization, filters]);
  const activeFilters = hasActiveFilters(filters);

  return (
    <div className="w-full h-full relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 bg-white focus:outline-none"
      >
        Szűrők
        {activeFilters && <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />}
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeas.map(tea => (
          <div key={tea.id} className="p-4 rounded-xl border">
            <div className="font-medium">{tea.name}</div>
            {tea.category && <div className="text-xs text-gray-500">{tea.category}</div>}
            {tea.subcategory && <div className="text-xs text-gray-400">{tea.subcategory}</div>}
          </div>
        ))}
      </div>

      <FilterPanel
        open={open}
        onClose={() => setOpen(false)}
        value={filters}
        onChange={setFilters}
        data={normalization}
      />
    </div>
  );
}