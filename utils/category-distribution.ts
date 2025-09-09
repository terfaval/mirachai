import { Tea } from './filter';

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Returns a new array of teas where the first `perPage` items contain at least
 * `minCategories` different categories. The order of the remaining items is
 * randomized. When only a single category is present, the original order is
 * preserved.
 */
export function distributeByCategory(
  teas: Tea[],
  perPage = 9,
  minCategories = 3,
): Tea[] {
  // Group teas by category
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
    return [...teas];
  }

  minCategories = Math.min(minCategories, byCategory.size, perPage);

  // shuffle categories and teas within categories for randomness
  const categories = shuffle(Array.from(byCategory.keys()));
  for (const cat of categories) {
    byCategory.set(cat, shuffle(byCategory.get(cat)!));
  }

  const result: Tea[] = [];

  // Ensure at least one tea from `minCategories` different categories
  for (const cat of categories.slice(0, minCategories)) {
    const list = byCategory.get(cat)!;
    if (list.length > 0) {
      result.push(list.shift()!);
    }
  }

  // Collect remaining teas and shuffle
  let pool: Tea[] = [];
  for (const list of byCategory.values()) {
    pool = pool.concat(list);
  }
  pool = shuffle(pool);

  // Fill the rest of the first page
  while (result.length < perPage && pool.length > 0) {
    result.push(pool.shift()!);
  }

  // Append any remaining teas
  result.push(...pool);

  return result;
}