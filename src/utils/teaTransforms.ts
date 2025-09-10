import { Tea } from '@/types/tea';
import { toStringArray } from '../../lib/toStringArray';
type IngredientItem = { name: string; rate: number };

export function buildIngredients(tea: any): IngredientItem[] {
  const items: IngredientItem[] = [];
  for (let i = 1; i <= 6; i++) {
    const name = tea[`ingerdient-${i}`] ?? tea[`ingredient-${i}`];
    const rate = Number(tea[`rate-${i}`] ?? 0);
    if (name && rate > 0) items.push({ name: String(name), rate });
  }
  const sum = items.reduce((s, it) => s + it.rate, 0) || 1;
  return items.map((it) => ({ ...it, rate: (it.rate / sum) * 100 }));
}

export function sortTasteDescending(tea: any) {
  const tasteKeys = Object.keys(tea).filter(k => k.startsWith('taste_'));
  const pairs = tasteKeys.map(k => ({ key: k, label: k.replace('taste_', ''), value: Number(tea[k] ?? 0) }));
  return pairs.sort((a,b) => b.value - a.value);
}

export function getFocusOrdered(tea: any) {
  const order = ['immunity','relax','focus','detox'];
  return order.map(key => {
    const raw = tea[`focus_${key}`] ?? tea[`function_${key}`] ?? 0;
    return { key, label: key, value: Number(raw) };
  });
}

export function caffeineToPct(tea: any): number {
  const v = Number(tea.caffeine_pct ?? tea.caffeine ?? 0);
  return Math.max(0, Math.min(100, v));
}

export function normalizeServeFlags(tea: any) {
  const toBool = (x: any) => (typeof x === 'string' ? x.toUpperCase() === 'TRUE' : !!x);
  return {
    hot: toBool(tea.serve_hot),
    lukewarm: toBool(tea.serve_lukewarm),
    iced: toBool(tea.serve_iced),
    coldbrew: toBool(tea.serve_coldbrew),
  };
}

export function resolveColorForCup(tea: any, fallback = '#C8B8DB') {
  // ha van getTeaColor util, inkább azt használd; ide ideiglenes fallback
  return tea.colorHex ?? fallback;
}

// season/daypart szegmensek építése (0..1 arányokkal)
export function buildSeasonSegments(tea: any, colorDark: string) {
  const keys = ['tavasz','nyár','ősz','tél'];
  const seasonArr = toStringArray(tea.season_recommended);
  const segments = keys.map(k => ({
    key: k,
    color: colorDark,
    active: seasonArr.includes(k) || Number(tea[`season_${k}`] ?? 0) > 0,
  }));
  const text = seasonArr.length === 4 ? 'egész évben' : seasonArr.join(', ');
  return { segments, text };
}

export function buildDaySegments(tea: any, colorDark: string) {
  const parts = [
    { key: 'reggel', start: 0, end: 1 },
    { key: 'délelőtt', start: 1, end: 2 },
    { key: 'kora_délután', start: 2, end: 3 },
    { key: 'délután', start: 3, end: 4 },
    { key: 'este', start: 4, end: 5 },
    { key: 'éjszaka', start: 5, end: 6 },
  ];
  const rec = toStringArray(tea.daypart_recommended);
  let hasAfterMeal = rec.includes('étkezés_után');
  const segments = parts.map(p => ({
    ...p,
    color: colorDark,
    active: hasAfterMeal || rec.includes(p.key) || Number(tea[`daypart_${p.key}`] ?? 0) > 0,
  }));

  let hasBeforeSleep = false;
  const daySet = new Set<string>();
  rec.forEach(d => {
    if (d === 'kora_délután') {
      daySet.add('délután');
    } else if (d === 'délelőtt') {
      daySet.add('reggel');
    } else if (d === 'lefekvés_előtt') {
      hasBeforeSleep = true;
      daySet.add('este');
    } else if (d === 'bármikor') {
      ['reggel','délután','este'].forEach(n => daySet.add(n));
    } else {
      daySet.add(d);
    }
  });
  if (hasAfterMeal) ['reggel','délután','este'].forEach(n => daySet.add(n));
  const dayNames = ['reggel','délután','este'];
  let text = '';
  if (hasAfterMeal) text = 'étkezés után';
  else if (hasBeforeSleep) text = 'lefekvés előtt';
  else if (dayNames.every(n => daySet.has(n))) text = 'egész nap';
  else text = dayNames.filter(n => daySet.has(n)).join(', ');

  return { segments, text };
}
