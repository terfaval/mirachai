import { describe, it, expect } from 'vitest';
import teas from '../data/teas.json';
import { buildIndex, search } from '../src/search/engine';
import { Tea } from '../src/search/types';

const rows = teas as Tea[];
const idx = buildIndex(rows);

const teaById = new Map(rows.map(t => [String(t.id), t]));

describe('search engine', () => {
  it('free query with fuzzy and serve evidence', () => {
    const res = search(idx, 'friss jeges chai');
    expect(res.some(r => r.name.toLowerCase().includes('chai') || (r.category || '').toLowerCase().includes('chai'))).toBe(true);
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

  it('category and taste', () => {
    const res = search(idx, 'category:"Japán Zöld" taste:virágos');
    expect(res.length).toBeGreaterThan(0);
    for (const r of res) {
      expect(r.category && r.category.includes('Japán Zöld')).toBe(true);
      const doc = teaById.get(r.id)!;
      expect((doc as any).taste_virágos || (doc as any)['taste_viragos']).toBeGreaterThan(0);
    }
  });

  it('negation', () => {
    const res = search(idx, '"zöld tea" -menta');
    for (const r of res) {
      const doc = teaById.get(r.id)!;
      const ings = Object.entries(doc)
        .filter(([k, v]) => k.startsWith('ingerdient') && typeof v === 'string')
        .map(([, v]) => String(v).toLowerCase())
        .join(' ');
      expect(ings.includes('menta')).toBe(false);
    }
  });

  it('fuzzy matching', () => {
    const res = search(idx, 'csipös');
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].why.some(w => w.includes('csipos'))).toBe(true);
  });
});