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

type ColorVariant = keyof Omit<ColorEntry, 'category'>;

const TEA_COLOR_MAP: Record<string, string> = (() => {
  const last = (colorScale as any)[(colorScale as any).length - 1];
  if (Array.isArray(last)) {
    return Object.fromEntries(
      (last as { tea: string; color: string }[]).map((t) => [
        t.tea,
        t.color.slice(0, 7),
      ])
    );
  }
  return {};
})();

const INGREDIENT_COLOR_MAP: Record<string, string> = (() => {
  const last = (colorScale as any)[(colorScale as any).length - 1];
  if (last && typeof last === 'object' && !Array.isArray(last)) {
    return Object.fromEntries(
      Object.entries(last).map(([name, val]: [string, any]) => [name, (val as any).hex])
    );
  }
  return {};
})();

export function getTeaColor(teaName: string): string {
  return TEA_COLOR_MAP[teaName] ?? DEFAULT_COLOR;
}

export function getIngredientColor(name: string): string {
  return INGREDIENT_COLOR_MAP[name] ?? DEFAULT_COLOR;
}

export function getIngredientColorScale(): Record<string, string> {
  return INGREDIENT_COLOR_MAP;
}

export function getCategoryColor(
  category: string,
  variant: ColorVariant = 'main'
): string {
  const entry = (colorScale as ColorEntry[]).find((c) => c.category === category);
  return entry?.[variant] ?? entry?.main ?? DEFAULT_COLOR;
}

export function getLightColor(
  category: string,
  variant: ColorVariant = 'light'
): string {
  const entry = (colorScale as ColorEntry[]).find((c) => c.category === category);
  return entry?.[variant] ?? entry?.light ?? DEFAULT_COLOR;
}

export function getDarkColor(
  category: string,
  variant: ColorVariant = 'dark'
): string {
  const entry = (colorScale as ColorEntry[]).find((c) => c.category === category);
  return entry?.[variant] ?? entry?.dark ?? DEFAULT_COLOR;
}

export function getComplementaryColor(
  category: string,
  variant: ColorVariant = 'complementary'
): string {
  const entry = (colorScale as ColorEntry[]).find((c) => c.category === category);
  return entry?.[variant] ?? entry?.complementary ?? DEFAULT_COLOR;
}

export function getAlternativeColor(
  category: string,
  variant: ColorVariant = 'alternative'
): string {
  const entry = (colorScale as ColorEntry[]).find((c) => c.category === category);
  return entry?.[variant] ?? entry?.alternative ?? DEFAULT_COLOR;
}

export function getWhiteColor(
  category: string,
  variant: ColorVariant = 'white'
): string {
  const entry = (colorScale as ColorEntry[]).find((c) => c.category === category);
  return entry?.[variant] ?? entry?.white ?? DEFAULT_COLOR;
}

export function getTasteColor(
  taste: string,
  variant: ColorVariant = 'main'
): string {
  const key = taste.startsWith('taste_') ? taste : `taste_${taste}`;

  // először a kategóriák között keres
  let entry = (colorScale as ColorEntry[]).find((c) => c.category === key);

  // ha nincs találat, próbáljon lookup-olni egy egyszerű objektumból
  if (!entry) {
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

  return entry?.[variant] ?? entry?.main ?? DEFAULT_COLOR;
}