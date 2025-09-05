import { colorMap } from '../data/colorMap';

export function getCategoryColor(category: string): string {
  return colorMap[category] ?? '#6B4226';
}