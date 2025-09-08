import { Filters } from "./types";

/** Build the query string the search engine understands from free text + filters */
export function buildQueryFromFilters(text: string, f: Filters): string {
  const parts: string[] = [];
  if (text.trim()) parts.push(text.trim());

  if (f.category) parts.push(`category:"${f.category}"`);
  if (f.subcategory) parts.push(`subcategory:"${f.subcategory}"`);

  f.tastes.forEach(t => parts.push(`taste:${t}`));
  f.focus.forEach(t => parts.push(`focus:${t}`));

  if (f.serve.iced) parts.push("serve:jeges");
  if (f.serve.hot) parts.push("serve:forron");
  if (f.serve.lukewarm) parts.push("serve:langyosan");
  if (f.serve.coldbrew) parts.push("serve:cold brew");

  f.allergens_exclude.forEach(a => parts.push(`allergens:!${a}`));

  f.intensity.forEach(i => parts.push(`intensity:${i}`));
  f.colors.forEach(c => parts.push(`color:"${c}"`));

  const [cafMin, cafMax] = f.caffeineRange;
  if (cafMin > 0) parts.push(`caffeine:>${Math.round(cafMin)}`);
  if (cafMax < 100) parts.push(`caffeine:<${Math.round(cafMax)}`);

  const [tMin, tMax] = f.tempCRange;
  parts.push(`tempC:>=${Math.round(tMin)}`);
  parts.push(`tempC:<=${Math.round(tMax)}`);

  const [sMin, sMax] = f.steepRange;
  parts.push(`steepMin:>=${Math.round(sMin)}`);
  parts.push(`steepMin:<=${Math.round(sMax)}`);

  f.ingredients.forEach(ing => parts.push(ing));

  return parts.join(" ");
}