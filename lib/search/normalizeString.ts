export const SEARCH_WEIGHTS = {
  name: 3,
  category: 2,
  subcategory: 1,
  description: 2,
  mood_short: 2,
  function: 1,
  'tag-1': 1,
  'tag-2': 1,
  'tag-3': 1,
  'ingerdient-1': 1,
  'ingerdient-2': 1,
  'ingerdient-3': 1,
  'ingerdient-4': 1,
  'ingerdient-5': 1,
  'ingerdient-6': 1,
  fullDescription: 2,
  when: 1,
  origin: 1,
} as const;

export type SearchWeightKey = keyof typeof SEARCH_WEIGHTS;

export function normalizeString(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}