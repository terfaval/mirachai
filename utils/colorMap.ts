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

export function getCategoryColor(category: string): string {
  const entry = (colorScale as ColorEntry[]).find(c => c.category === category);
  return entry?.main ?? DEFAULT_COLOR;
}