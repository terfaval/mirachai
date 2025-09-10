"use client";

import React, { useEffect, useMemo, useState } from "react";
import FilterPanel from "./filters/FilterPanel";
import teasJson from "../../data/teas.json";

type Tea = Record<string, any> & { id: number | string; name: string; category?: string };

export type FilterState = {
  categories: string[];
  ingredients: string[];
  tastes: Record<string, number>;
  focuses: Record<string, number>;
  intensity?: number;
  steepMin?: number;
  caffeine?: number;
  allergens: string[];
  dayparts: string[];
  seasons: string[];
};

const DEFAULT_FILTERS: FilterState = {
  categories: [],
  ingredients: [],
  tastes: {},
  focuses: {},
  allergens: [],
  dayparts: [],
  seasons: []
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "_");

function deriveAllIngredients(teas: Tea[]): string[] {
  const set = new Set<string>();
  teas.forEach(t => {
    Object.entries(t).forEach(([k, v]) => {
      if (/(ingerdient|ingredient)-\d+/.test(k) && typeof v === "string") {
        const s = v.trim().toLowerCase();
        if (s) set.add(s);
      }
    });
  });
  return Array.from(set).sort();
}

function applyFilters(teas: Tea[], f: FilterState): Tea[] {
  return teas.filter(t => {
    if (f.categories.length && !f.categories.includes(t.category || "")) return false;

    if (f.ingredients.length) {
      const ing = Object.entries(t)
        .filter(([k]) => /(ingerdient|ingredient)-\d+/.test(k))
        .map(([, v]) => (typeof v === "string" ? v.toLowerCase().trim() : ""))
        .filter(Boolean);
      if (!f.ingredients.every(i => ing.includes(i.toLowerCase()))) return false;
    }

    for (const [k, val] of Object.entries(f.tastes)) {
      const key = `taste_${slug(k)}`;
      const tv = Number(t[key]) || 0;
      if (tv < val) return false;
    }

    for (const [k, val] of Object.entries(f.focuses)) {
      const key = `focus_${slug(k)}`;
      const tv = Number(t[key]) || 0;
      if (tv < val) return false;
    }

    if (f.intensity !== undefined) {
      const iv = (t as any).intensity;
      if (iv !== undefined && iv < f.intensity) return false;
    }

    if (f.steepMin !== undefined) {
      const sv = (t as any).steepMin;
      if (sv !== undefined && sv > f.steepMin) return false;
    }

    if (f.caffeine !== undefined) {
      const cv = (t as any).caffeine;
      if (cv !== undefined && cv > f.caffeine) return false;
    }

    if (f.allergens.length) {
      for (const al of f.allergens) {
        const key = `allergen_${slug(al)}`;
        if ((t as any)[key]) return false;
      }
    }

    if (f.dayparts.length) {
      const ok = f.dayparts.some(d => (t as any)[`daypart_${slug(d)}`]);
      if (!ok) return false;
    }

    if (f.seasons.length) {
      const ok = f.seasons.some(d => (t as any)[`season_${slug(d)}`]);
      if (!ok) return false;
    }

    return true;
  });
}

export default function TeaSearchWithFilters({ teas }: { teas?: Tea[] }) {
  const teaList = (teas || (teasJson as Tea[]));
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [open, setOpen] = useState(false);
  const [allIngredients, setAllIngredients] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/data/ingredients.json");
        if (res.ok) {
          setAllIngredients(await res.json());
          return;
        }
      } catch {}
      setAllIngredients(deriveAllIngredients(teaList));
    }
    load();
  }, [teaList]);

  const allCategories = useMemo(
    () => Array.from(new Set(teaList.map(t => t.category).filter(Boolean))) as string[],
    [teaList]
  );

  const allTastes = useMemo(() => {
    const s = new Set<string>();
    teaList.forEach(t => {
      Object.keys(t).forEach(k => {
        if (k.startsWith("taste_")) s.add(k.slice(6));
      });
    });
    return Array.from(s);
  }, [teaList]);

  const allFocuses = useMemo(() => {
    const s = new Set<string>();
    teaList.forEach(t => {
      Object.keys(t).forEach(k => {
        if (k.startsWith("focus_")) s.add(k.slice(6));
      });
    });
    return Array.from(s);
  }, [teaList]);

  const allAllergens = useMemo(() => {
    const s = new Set<string>();
    teaList.forEach(t => {
      Object.keys(t).forEach(k => {
        if (k.startsWith("allergen_")) s.add(k.slice(9));
      });
    });
    return Array.from(s);
  }, [teaList]);

  const allDayparts = useMemo(() => {
    const s = new Set<string>();
    teaList.forEach(t => {
      Object.keys(t).forEach(k => {
        if (k.startsWith("daypart_")) s.add(k.slice(8));
      });
    });
    return Array.from(s);
  }, [teaList]);

  const allSeasons = useMemo(() => {
    const s = new Set<string>();
    teaList.forEach(t => {
      Object.keys(t).forEach(k => {
        if (k.startsWith("season_")) s.add(k.slice(7));
      });
    });
    return Array.from(s);
  }, [teaList]);

  const filteredTeas = useMemo(() => applyFilters(teaList, filters), [teaList, filters]);

  return (
    <div className="w-full h-full relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 bg-white"
      >
        Szűrők
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeas.map(t => (
          <div key={t.id} className="p-4 rounded-xl border">
            <div className="font-medium">{t.name}</div>
            {t.category && <div className="text-xs text-gray-500">{t.category}</div>}
          </div>
        ))}
      </div>

      <FilterPanel
        open={open}
        onClose={() => setOpen(false)}
        value={filters}
        onChange={setFilters}
        allCategories={allCategories}
        allIngredients={allIngredients}
        allTastes={allTastes}
        allFocuses={allFocuses}
        allAllergens={allAllergens}
        allDayparts={allDayparts}
        allSeasons={allSeasons}
      />
    </div>
  );
}