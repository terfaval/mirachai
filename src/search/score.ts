import { BuiltIndex } from './types';

export const FIELD_WEIGHTS = {
  name: 3.0,
  desc: 1.2,
  ing: 1.8,
  cat: 1.4,
  sub: 1.4,
  tag: 1.6,
} as const;

export const idf = (N: number, df: number) => Math.log(1 + (N - df + 0.5) / (df + 0.5));

const trigram = (t: string): string[] => {
  const res: string[] = [];
  for (let i = 0; i < t.length - 2; i++) res.push(t.slice(i, i + 3));
  return res;
};

const ed1 = (a: string, b: string): boolean => {
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0, j = 0, diff = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i++; j++; }
    else {
      if (++diff > 1) return false;
      if (la > lb) i++; else if (lb > la) j++; else { i++; j++; }
    }
  }
  if (i < la || j < lb) diff++;
  return diff <= 1;
};

/** expand token with edit-distance 1 candidates using trigrams */
export function fuzzyExpand(bx: BuiltIndex, token: string): string[] {
  if (token.length < 5) return [token];
  const cands = new Set<string>();
  for (const tri of trigram(token)) {
    const set = bx.trigrams.get(tri);
    if (set) for (const t of set) cands.add(t);
  }
  const out = [token];
  for (const c of cands) {
    if (c !== token && ed1(token, c)) out.push(c);
  }
  return out;
}