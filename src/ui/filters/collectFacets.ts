import { Tea } from "./types";

const uniq = <T,>(a: T[]) => Array.from(new Set(a));

export function collectFacets(data: Tea[]) {
  const categories = uniq(data.map(d => (d.category || "").trim()).filter(Boolean)).sort();

  const subcatsByCat: Record<string, string[]> = {};
  for (const c of categories) {
    subcatsByCat[c] = uniq(
      data.filter(d => d.category === c).map(d => (d.subcategory || "").trim()).filter(Boolean)
    ).sort();
  }

  const intensities = uniq(data.map(d => (d.intensity || "").trim()).filter(Boolean)).sort();
  const colors = uniq(data.map(d => (d.color || "").trim()).filter(Boolean)).sort();

  const allergens = uniq(
    data.flatMap(d => (d.allergens || "").split("|").map(s => s.trim()).filter(Boolean))
  ).sort();

  const tasteKeys = uniq(
    data.flatMap(d => Object.keys(d).filter(k => k.startsWith("taste_") && Number(d[k as keyof Tea] || 0) > 0))
  ).map(k => k.replace("taste_", "")).sort();

  const focusKeys = uniq(
    data.flatMap(d => Object.keys(d).filter(k => k.startsWith("focus_") && Number(d[k as keyof Tea] || 0) > 0))
  ).map(k => k.replace("focus_", "")).sort();

  const ingredientKeys = uniq(
    data.flatMap(d => Array.from({ length: 8 }, (_, i) => (d as any)[`ingerdient-${i + 1}`] || "")
      .map(v => String(v).trim().toLowerCase()).filter(Boolean))
  ).sort();

  const caffeineAll = data.map(d => Number(d.caffeine_pct ?? 0));
  const tempAll = data.map(d => Number(d.tempC ?? 0)).filter(n => !Number.isNaN(n));
  const steepAll = data.map(d => Number(d.steepMin ?? 0)).filter(n => !Number.isNaN(n));

  const ranges = {
    caffeine: [Math.max(0, Math.min(...caffeineAll, 0)), Math.min(100, Math.max(...caffeineAll, 100))] as [number, number],
    tempC: [Math.min(...tempAll, 60), Math.max(...tempAll, 100)] as [number, number],
    steepMin: [Math.min(...steepAll, 1), Math.max(...steepAll, 10)] as [number, number],
  };

  return { categories, subcatsByCat, intensities, colors, allergens, tasteKeys, focusKeys, ingredientKeys, ranges };
}