import { describe, it, expect } from 'vitest';
import { distributeByCategory } from '../utils/category-distribution';
import type { Tea } from '../utils/filter';

const t = (id: number, category: string): Tea => ({ id, name: String(id), category });

describe('distributeByCategory', () => {
  it('ensures at least the requested categories in first page', () => {
    const teas = [
      t(1, 'A'),
      t(2, 'A'),
      t(3, 'B'),
      t(4, 'B'),
      t(5, 'C'),
      t(6, 'D'),
      t(7, 'E'),
      t(8, 'F'),
      t(9, 'G'),
    ];
    const result = distributeByCategory(teas, 9, 4);
    const firstCategories = new Set(result.slice(0, 9).map((r) => r.category));
    expect(firstCategories.size).toBeGreaterThanOrEqual(4);
  });

  it('keeps order when only one category', () => {
    const teas = [t(2, 'A'), t(1, 'A'), t(3, 'A')];
    const result = distributeByCategory(teas);
    expect(result.map((r) => r.id)).toEqual([2, 1, 3]);
  });
});