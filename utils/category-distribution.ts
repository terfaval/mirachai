import { Tea } from './filter';

/**
 * Returns a new array of teas arranged in a round-robin fashion so that
 * items from different categories are interleaved. Each category list is
 * kept in the order of appearance of the original array.
 */
export function distributeByCategory(teas: Tea[]): Tea[] {
  // Group teas by category preserving order
  const byCategory = new Map<string, Tea[]>();
  for (const tea of teas) {
    const list = byCategory.get(tea.category);
    if (list) {
      list.push(tea);
    } else {
      byCategory.set(tea.category, [tea]);
    }
  }

  if (byCategory.size <= 1) {
    // single category - preserve original order (caller may sort by id later)
    return [...teas];
  }

  // Round-robin merge of category lists
  const categories = Array.from(byCategory.keys());
  const indices = Object.fromEntries(categories.map((c) => [c, 0]));
  const result: Tea[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const cat of categories) {
      const list = byCategory.get(cat)!;
      const idx = indices[cat];
      if (idx < list.length) {
        result.push(list[idx]);
        indices[cat] = idx + 1;
        added = true;
      }
    }
  }
  return result;
}