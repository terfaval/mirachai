import { Tea } from '@/types/tea';
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
  const values = keys.map(k => Number(tea[`season_${k}`] ?? 0));
  const sum = values.reduce((a,b)=>a+b,0) || 1;
  return values.map(v => ({ value: v/sum, color: colorDark, active: v>0 }));
}

export function buildDaySegments(tea: any, colorDark: string) {
  const keys = ['reggel','délelőtt','kora_délután','délután','este','éjszaka'];
  const values = keys.map(k => Number(tea[`daypart_${k}`] ?? 0));
  const sum = values.reduce((a,b)=>a+b,0) || 1;
  return values.map(v => ({ value: v/sum, color: colorDark, active: v>0 }));
}
