import { describe, it, expect } from 'vitest';
import teas from '../data/teas.json';
import { buildIndex, search } from '../src/search/engine';
import { Tea } from '../src/search/types';
import { toStringArray } from '../lib/toStringArray';

const rows: Tea[] = (teas as any[]).map((t) => ({
  ...t,
  season_recommended: toStringArray(t.season_recommended),
  daypart_recommended: toStringArray(t.daypart_recommended),
}));
const idx = buildIndex(rows);

const teaById = new Map(rows.map(t => [String(t.id), t]));

describe('search engine', () => {
  it('free query finds chai teas', () => {
    const res = search(idx, 'chai');
    expect(res.some(r => r.name.toLowerCase().includes('chai') || (r.category || '').toLowerCase().includes('chai'))).toBe(true);
  });

  it('infers serve facet from token', () => {
    const res = search(idx, 'jegest');
    expect(res.length).toBeGreaterThan(0);
    for (const r of res) {
      const doc = teaById.get(r.id)!;
      expect(doc.serve_iced).toBe('TRUE');
    }
  });
  
  it('facet and range filters', () => {
    const res = search(idx, 'caffeine:<20 taste:friss serve:iced');
    expect(res.length).toBeGreaterThan(0);
    for (const r of res) {
      const doc = teaById.get(r.id)!;
      expect((doc.caffeine_pct ?? 0)).toBeLessThan(20);
      expect((doc.serve_iced)).toBe('TRUE');
    }
  });

  it('allergen exclusion', () => {
    const res = search(idx, 'allergens:!citrus');
    for (const r of res) {
      const all = String(teaById.get(r.id)!.allergens || '').toLowerCase();
      expect(all.includes('citrus')).toBe(false);
    }
  });

  it('category filter works', () => {
    const res = search(idx, 'Indiai Chai');
    expect(res.length).toBeGreaterThan(0);
    expect(res.some(r => (r.category || '').includes('Indiai Chai') || r.name.includes('Chai'))).toBe(true);
  });

  it('ingredient search matches menta', () => {
    const res = search(idx, 'menta');
    expect(res.length).toBeGreaterThan(0);
    for (const r of res) {
      const doc = teaById.get(r.id)!;
      const ings = Object.entries(doc)
        .filter(([k, v]) => k.startsWith('ingerdient') && typeof v === 'string')
        .map(([, v]) => String(v).toLowerCase())
        .join(' ');
      expect(ings.includes('menta')).toBe(true);
    }
  });

  it('fuzzy matching', () => {
    const res = search(idx, 'csipös');
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].why.some(w => w.includes('csipos'))).toBe(true);
  });
});