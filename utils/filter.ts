export interface Tea {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  mood_short?: string;
  function?: string;
  ['tag-1']?: string;
  ['tag-2']?: string;
  ['tag-3']?: string;
  ['ingerdient-1']?: string;
  ['ingerdient-2']?: string;
  ['ingerdient-3']?: string;
  ['ingerdient-4']?: string;
  ['ingerdient-5']?: string;
  ['ingerdient-6']?: string;
  intensity?: string;
}

export function filterTeas(teas: Tea[], query: string): Tea[] {
  if (!query) return teas;
  const q = norm(query);
  const weights: Record<string, number> = {
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
  };

  return teas
    .map((tea) => {
      let score = 0;
      for (const [field, weight] of Object.entries(weights)) {
        const value = (tea as any)[field];
        if (value && norm(String(value)).includes(q)) {
          score += weight;
        }
      }
      return { tea, score };
    })
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((t) => t.tea);
}

function norm(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}