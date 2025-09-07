import colorScale from '../data/colorScale.json';

interface ColorEntry {
  category: string;
  main: string;
  light?: string;
  dark?: string;
  complementary?: string;
  alternative?: string;
}

const DEFAULT_COLOR = '#6B4226';

type ColorVariant = keyof Omit<ColorEntry, 'category'>;

export function getCategoryColor(
  category: string,
  variant: ColorVariant = 'main'
): string {
  const entry = (colorScale as ColorEntry[]).find((c) => c.category === category);
  return entry?.[variant] ?? entry?.main ?? DEFAULT_COLOR;
}

export function getComplementaryColor(
  category: string,
  variant: ColorVariant = 'dark'
): string {
  const entry = (colorScale as ColorEntry[]).find((c) => c.category === category);
  return entry?.[variant] ?? entry?.dark ?? DEFAULT_COLOR;
}