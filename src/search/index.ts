import { tokenize } from './normalize';
import { mapSyn } from './synonyms';
import { BuiltIndex, Tea, Posting } from './types';

const FIELD_WEIGHTS = {
  name: 3.0,
  desc: 1.2,
  ing: 1.8,
  cat: 1.4,
  sub: 1.4,
  tag: 1.6,
  day: 1.2,
} as const;

const DAYPART_WEIGHTS: Record<string, number> = {
  reggel: 1,
  delelott: 1,
  kora_delutan: 1,
  delutan: 1,
  este: 1,
  lefekves_elott: 5,
  barmikor: 0.2,
  etkezes_utan: 0.2,
};

const trigram = (t: string): string[] => {
  const res: string[] = [];
  for (let i = 0; i < t.length - 2; i++) res.push(t.slice(i, i + 3));
  return res;
};

/** Build inverted index for teas */
export function build(rows: Tea[]): BuiltIndex {
  const docs = new Map<string, Tea>();
  const inv = new Map<string, Posting[]>();
  const trigrams = new Map<string, Set<string>>();
  const df = new Map<string, number>();
  const N = rows.length;

  for (const row of rows) {
    const id = String(row.id);
    docs.set(id, row);
    const docTokens = new Set<string>();
    const addToken = (tok: string, field: Posting['f'], tf = 1) => {
      if (!tok) return;
      const posting: Posting = { id, f: field, tf };
      if (!inv.has(tok)) inv.set(tok, []);
      inv.get(tok)!.push(posting);
      docTokens.add(tok);
      if (tok.length >= 3) {
        for (const tri of trigram(tok)) {
          if (!trigrams.has(tri)) trigrams.set(tri, new Set());
          trigrams.get(tri)!.add(tok);
        }
      }
    };

    // index name
    if (row.name) {
      const counts: Record<string, number> = {};
      for (const t of tokenize(String(row.name)).map(mapSyn)) {
        counts[t] = (counts[t] || 0) + 1;
      }
      for (const [t, c] of Object.entries(counts)) addToken(t, 'name', c);
    }

    // description + mood_short
    const desc = [row.description, row.mood_short].filter(Boolean).join(' ');
    if (desc) {
      const counts: Record<string, number> = {};
      for (const t of tokenize(desc).map(mapSyn)) counts[t] = (counts[t] || 0) + 1;
      for (const [t, c] of Object.entries(counts)) addToken(t, 'desc', c);
    }

    // category
    if (row.category) {
      for (const t of tokenize(String(row.category)).map(mapSyn)) addToken(t, 'cat');
    }
    // subcategory
    if (row.subcategory) {
      for (const t of tokenize(String(row.subcategory)).map(mapSyn)) addToken(t, 'sub');
    }

    // ingredients
    for (const [k, v] of Object.entries(row)) {
      if (k.startsWith('ingerdient') && typeof v === 'string' && v) {
        for (const t of tokenize(v).map(mapSyn)) addToken(t, 'ing');
      }
    }

    // taste_/focus_ tags
    for (const [k, v] of Object.entries(row)) {
      if ((k.startsWith('taste_') || k.startsWith('focus_')) && typeof v === 'number' && v > 0) {
        const label = mapSyn(k.split('_')[1]);
        addToken(label, 'tag', v);
      }
    }

    // daypart recommendations
    if (Array.isArray(row.daypart_recommended)) {
      for (const dp of row.daypart_recommended) {
        for (const t of tokenize(dp).map(mapSyn)) {
          const w = DAYPART_WEIGHTS[t] ?? 1;
          addToken(t, 'day', w);
        }
      }
    }
    
    // update df
    for (const t of docTokens) {
      df.set(t, (df.get(t) || 0) + 1);
    }
  }

  return { docs, inv, trigrams, df, N };
}

export const FIELD_WEIGHTS_MAP = FIELD_WEIGHTS;