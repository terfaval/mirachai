// colorMap.ts — robusztus feloldás

import colorScale from '../data/colorScale.json';
import teaColorLabels from '../data/teaColorLabels.json';

interface ColorEntry {
  category: string;
  main: string;
  light?: string;
  dark?: string;
  complementary?: string;
  alternative?: string;
  white?: string;
}

const DEFAULT_COLOR = '#6B4226';

const norm = (s?: string) =>
  (s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

type ColorVariant = keyof Omit<ColorEntry, 'category'>;
const isHex = (s?: string) => !!s && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s);

// --- címke → hex (külön JSON-ból) ---
const COLOR_LABEL_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(teaColorLabels as Record<string, string>).map(([k, v]) => [norm(k), String(v)])
);

// --- teaNév → hex (a colorScale legvégén lévő tömbből) ---
const TEA_COLOR_MAP: Record<string, string> = (() => {
  if (!Array.isArray(colorScale)) return {};
  // FINOMHANG: ha később több ilyen tömb is lesz, itt lehet szűrni mezőkre
  const arr =
    (colorScale as any[]).slice().reverse()
      .find((x) => Array.isArray(x) && x.every((t: any) => t && 'tea' in t && 'color' in t)) || [];
  return Object.fromEntries(
    (arr as any[]).map((t: any) => [String(t.tea), String(t.color).slice(0, 7)])
  );
})();

// --- összetevő-típus (leaf/flower/fruit/...) → hex ---
const INGREDIENT_TYPE_COLORS: Record<string, string> = (() => {
  if (!Array.isArray(colorScale)) return {};
  const obj =
    (colorScale as any[]).slice().reverse()
      .find(
        (x) =>
          x && !Array.isArray(x) && typeof x === 'object' &&
          // kulcsok alapján azonosítjuk
          ('leaf' in x || 'flower' in x || 'fruit' in x || 'root' in x || 'stem' in x || 'other' in x)
      );
  return obj
    ? Object.fromEntries(Object.entries(obj as Record<string, string>).map(([k, v]) => [norm(k), String(v)]))
    : {};
})();

// --- összetevő-név → { hex, type } ---
const INGREDIENT_INFO_MAP: Record<string, { hex: string; type?: string }> = (() => {
  if (!Array.isArray(colorScale)) return {};
  const obj =
    (colorScale as any[]).slice().reverse()
      .find(
        (x) =>
          x && !Array.isArray(x) && typeof x === 'object' &&
          // értékek között van {hex, ...}
          Object.values(x as Record<string, any>).some((v: any) => v && typeof v === 'object' && 'hex' in v)
      );
  return obj
    ? Object.fromEntries(
        Object.entries(obj as Record<string, any>).map(([name, val]) => [
          norm(name),
          { hex: String(val.hex), type: val.type ? String(val.type) : undefined },
        ])
      )
    : {};
})();

const INGREDIENT_COLOR_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(INGREDIENT_INFO_MAP).map(([k, v]) => [k, v.hex])
);

// --- FŐ: tea szín feloldása ---
export function getTeaColor(input: string): string {
  if (!input) return DEFAULT_COLOR;
  const raw = input.trim();
  if (isHex(raw)) return raw;
  if (TEA_COLOR_MAP[raw]) return TEA_COLOR_MAP[raw]; // FINOMHANG: ha normolni kellene, itt lehet
  const byLabel = COLOR_LABEL_MAP[norm(raw)];
  if (byLabel) return byLabel;
  return DEFAULT_COLOR;
}

export const getTeaColorByLabel = (label?: string) =>
  label ? COLOR_LABEL_MAP[norm(label)] ?? DEFAULT_COLOR : DEFAULT_COLOR;

// --- ingredient, category, taste: változatlan API, de most már lesz adat ---
export function getIngredientColor(name: string, type?: string): string {
  const key = norm(name);
  const info = INGREDIENT_INFO_MAP[key];
  if (info) return info.hex;
  if (type) {
    const tKey = norm(type);
    const tColor = INGREDIENT_TYPE_COLORS[tKey];
    if (tColor) return tColor;
  }
  return INGREDIENT_TYPE_COLORS['other'] ?? DEFAULT_COLOR;
}

export function getIngredientColorScale(): Record<string, string> {
  return INGREDIENT_COLOR_MAP;
}

export function getCategoryColor(category: string, variant: ColorVariant = 'main'): string {
  if (!Array.isArray(colorScale)) return DEFAULT_COLOR;
  const entry = (colorScale as ColorEntry[]).find((c) => c.category === category);
  return entry?.[variant] ?? entry?.main ?? DEFAULT_COLOR;
}

export function getLightColor(category: string, variant: ColorVariant = 'light'): string {
  if (!Array.isArray(colorScale)) return DEFAULT_COLOR;
  const entry = (colorScale as ColorEntry[]).find((c) => c.category === category);
  return entry?.[variant] ?? entry?.light ?? DEFAULT_COLOR;
}

export function getDarkColor(category: string, variant: ColorVariant = 'dark'): string {
  if (!Array.isArray(colorScale)) return DEFAULT_COLOR;
  const entry = (colorScale as ColorEntry[]).find((c) => c.category === category);
  return entry?.[variant] ?? entry?.dark ?? DEFAULT_COLOR;
}

export function getComplementaryColor(category: string, variant: ColorVariant = 'complementary'): string {
  if (!Array.isArray(colorScale)) return DEFAULT_COLOR;
  const entry = (colorScale as ColorEntry[]).find((c) => c.category === category);
  return entry?.[variant] ?? entry?.complementary ?? DEFAULT_COLOR;
}

export function getAlternativeColor(category: string, variant: ColorVariant = 'alternative'): string {
  if (!Array.isArray(colorScale)) return DEFAULT_COLOR;
  const entry = (colorScale as ColorEntry[]).find((c) => c.category === category);
  return entry?.[variant] ?? entry?.alternative ?? DEFAULT_COLOR;
}

export function getWhiteColor(category: string, variant: ColorVariant = 'white'): string {
  if (!Array.isArray(colorScale)) return DEFAULT_COLOR;
  const entry = (colorScale as ColorEntry[]).find((c) => c.category === category);
  return entry?.[variant] ?? entry?.white ?? DEFAULT_COLOR;
}

export function getTasteColor(taste: string, variant: ColorVariant = 'main'): string {
  const key = taste.startsWith('taste_') ? taste : `taste_${taste}`;
  if (Array.isArray(colorScale)) {
    const entry = (colorScale as ColorEntry[]).find((c) => c.category === key);
    if (entry) return entry?.[variant] ?? entry?.main ?? DEFAULT_COLOR;
  }
  const fallback: Record<string, string> = {
    taste_friss: '#4CAF50',
    taste_édeskés: '#FFB74D',
    taste_savanykás: '#FF7043',
    taste_fűszeres: '#8D6E63',
    taste_virágos: '#BA68C8',
    taste_gyümölcsös: '#E57373',
    taste_földes: '#6D4C41',
    taste_kesernyés: '#455A64',
    taste_csípős: '#F44336',
    taste_umami: '#7986CB',
  };
  return fallback[key] ?? DEFAULT_COLOR;
}
