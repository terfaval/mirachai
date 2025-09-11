import colorScale from '../data/colorScale.json';

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

// név normalizálás: kisbetű, trim, ékezet nélkül
function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}

type ColorVariant = keyof Omit<ColorEntry, 'category'>;

const isHex = (s?: string) => !!s && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s);

// --- ÚJ: címke → hex map, ha a colorScale JSON sima objektum (címkék) ---
const COLOR_LABEL_MAP: Record<string, string> = (() => {
  // ha az importált colorScale *nem* tömb, akkor címke→hex objektum
  if (colorScale && !Array.isArray(colorScale) && typeof colorScale === 'object') {
    return Object.fromEntries(
      Object.entries(colorScale as Record<string, string>).map(([k, v]) => [norm(k), String(v)])
    );
  }
  return {};
})();

// --- EDDIGI: tea-név → hex (ha a colorScale egy tömb végi blokkot tartalmaz) ---
const TEA_COLOR_MAP: Record<string, string> = (() => {
  if (Array.isArray(colorScale)) {
    const last = (colorScale as any)[(colorScale as any).length - 1];
    if (Array.isArray(last)) {
      return Object.fromEntries(
        (last as { tea: string; color: string }[]).map((t) => [t.tea, t.color.slice(0, 7)])
      );
    }
  }
  return {};
})();

// type alapú színek (leaf/flower/fruit/...)
const INGREDIENT_TYPE_COLORS: Record<string, string> = (() => {
  if (Array.isArray(colorScale)) {
    const secondLast = (colorScale as any)[(colorScale as any).length - 2];
    if (secondLast && typeof secondLast === 'object' && !Array.isArray(secondLast)) {
      return Object.fromEntries(
        Object.entries(secondLast).map(([k, v]: [string, any]) => [norm(k), String(v)])
      );
    }
  }
  return {};
})();

// konkrét hozzávaló -> {hex, type}
const INGREDIENT_INFO_MAP: Record<string, { hex: string; type?: string }> = (() => {
  if (Array.isArray(colorScale)) {
    const last = (colorScale as any)[(colorScale as any).length - 1];
    if (last && typeof last === 'object' && !Array.isArray(last)) {
      return Object.fromEntries(
        Object.entries(last).map(([name, val]: [string, any]) => [
          norm(name),
          { hex: String((val as any).hex), type: (val as any).type as string | undefined },
        ])
      );
    }
  }
  return {};
})();

const INGREDIENT_COLOR_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(INGREDIENT_INFO_MAP).map(([k, v]) => [k, v.hex])
);

// --- FRISSÍTETT: elfogad tea-nevet, címkét *vagy* hexet ---
export function getTeaColor(input: string): string {
  if (!input) return DEFAULT_COLOR;
  const raw = input.trim();
  if (isHex(raw)) return raw;                           // már hex
  if (TEA_COLOR_MAP[raw]) return TEA_COLOR_MAP[raw];    // tea-név map
  const byLabel = COLOR_LABEL_MAP[norm(raw)];           // címke map (pl. „halvány arany-barnás”)
  if (byLabel) return byLabel;
  return DEFAULT_COLOR;
}

// opcionális: direkt címke → hex
export function getTeaColorByLabel(label: string): string {
  return COLOR_LABEL_MAP[norm(label)] ?? DEFAULT_COLOR;
}

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

// taste színek maradnak
export function getTasteColor(taste: string, variant: ColorVariant = 'main'): string {
  const key = taste.startsWith('taste_') ? taste : `taste_${taste}`;
  if (Array.isArray(colorScale)) {
    const entry = (colorScale as ColorEntry[]).find((c) => c.category === key);
    if (entry) return entry?.[variant] ?? entry?.main ?? DEFAULT_COLOR;
  }
  const tasteColors: Record<string, string> = {
    taste_friss: '#4CAF50',
    taste_édeskés: '#FFB74D',
    taste_savanykás: '#FF7043',
    taste_fűszeres: '#8D6E63',
    taste_virágos: '#BA68C8',
    taste_gyümölcsös: '#E57373',
    taste_földes: '#6D4C41',
    taste_kesernyés: '#455A64',
    taste_csípős: '#F44336',
    taste_umami: '#7986CB'
  };
  return tasteColors[key] ?? DEFAULT_COLOR;
}
