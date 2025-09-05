export interface Tea {
  id: number;
  name: string;
  category: string;
  mood_short: string;
  ['tag-1']?: string;
  ['tag-2']?: string;
  ['tag-3']?: string;
}

export function filterTeas(teas: Tea[], query: string): Tea[] {
  if (!query) return teas;
  const q = query.toLowerCase();
  return teas.filter((t) =>
    t.name.toLowerCase().includes(q) ||
    (t.mood_short && t.mood_short.toLowerCase().includes(q)) ||
    [t['tag-1'], t['tag-2'], t['tag-3']].some(tag => tag && tag.toLowerCase().includes(q))
  );
}