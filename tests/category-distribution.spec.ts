import { describe, it, expect } from 'vitest';
import { distributeByCategory } from '../utils/category-distribution';
import type { Tea } from '../utils/filter';

const t = (id: number, category: string): Tea => ({ id, name: String(id), category });

describe('distributeByCategory', () => {
  it('interleaves teas from different categories', () => {
    const teas = [t(1, 'A'), t(2, 'A'), t(3, 'B'), t(4, 'B'), t(5, 'C')];
    const result = distributeByCategory(teas);
    const firstCategories = result.slice(0, 3).map((tea) => tea.category);
    expect(new Set(firstCategories).size).toBe(3);
  });

  it('keeps order when only one category', () => {
    const teas = [t(2, 'A'), t(1, 'A'), t(3, 'A')];
    const result = distributeByCategory(teas);
    expect(result.map((r) => r.id)).toEqual([2, 1, 3]);
  });
});