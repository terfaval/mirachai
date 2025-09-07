import { build as buildIdx } from './index';
import { parseQuery } from './query';
import { fuzzyExpand, idf, FIELD_WEIGHTS } from './score';
import { BuiltIndex, SearchResult, Tea } from './types';
import { accentFold } from './normalize';

/** Build index once at app load */
export function buildIndex(rows: Tea[]): BuiltIndex {
  return buildIdx(rows);
}

const serveField = (s: string) => {
  switch (s) {
    case 'jeges': return 'serve_iced';
    case 'forron': return 'serve_hot';
    case 'langyosan': return 'serve_lukewarm';
    case 'coldbrew': return 'serve_coldbrew';
    default: return 'serve_iced';
  }
};

/** Search the built index */
export function search(bx: BuiltIndex, qstr: string, opts: { fuzzy?: boolean } = { fuzzy: true }): SearchResult[] {
  const pq = parseQuery(qstr);
  const allTokens = [...pq.tokens, ...pq.must];
  const tokenExp = new Map<string, string[]>();
  const tokenSource = new Map<string, string>();

  for (const t of allTokens) {
    const exps = opts.fuzzy ? fuzzyExpand(bx, t) : [t];
    tokenExp.set(t, exps);
    for (const e of exps) tokenSource.set(e, t);
  }

  const scores = new Map<string, number>();
  const hits = new Map<string, Set<string>>();
  const reasons = new Map<string, Set<string>>();

  for (const [cand, orig] of tokenSource.entries()) {
    const postings = bx.inv.get(cand);
    if (!postings) continue;
    const idfVal = idf(bx.N, bx.df.get(cand) || 0);
    for (const p of postings) {
      const sc = p.tf * (FIELD_WEIGHTS as any)[p.f] * idfVal;
      scores.set(p.id, (scores.get(p.id) || 0) + sc);
      if (!hits.has(p.id)) hits.set(p.id, new Set());
      hits.get(p.id)!.add(cand);
      if (!reasons.has(p.id)) reasons.set(p.id, new Set());
      if (orig !== cand) reasons.get(p.id)!.add(`fuzzy: ${orig}→${cand}`);
      if (pq.tokens.includes(orig) || pq.must.includes(orig)) reasons.get(p.id)!.add(orig);
    }
  }

  if (scores.size === 0) {
    for (const id of bx.docs.keys()) {
      scores.set(id, 0);
      hits.set(id, new Set());
      reasons.set(id, new Set());
    }
  }

  const results: SearchResult[] = [];
  const getScaled = (doc: any, prefix: string, label: string): number => {
    const key = `${prefix}_${label}`;
    if (doc[key] != null) return Number(doc[key]);
    for (const k in doc) if (accentFold(k) === key) return Number(doc[k]);
    return 0;
  };
  for (const [id, scBase] of scores.entries()) {
    const doc = bx.docs.get(id)!;
    const docHits = hits.get(id)!;

    // token presence: only enforce must tokens
    let ok = true;
    for (const t of pq.must) {
      const exps = tokenExp.get(t)!;
      if (!exps.some(e => docHits.has(e))) { ok = false; break; }
    }
    if (!ok) continue;
    for (const t of pq.not) if (docHits.has(t)) { ok = false; break; }
    if (!ok) continue;

    // facets filters
    const addWhy = (w: string) => { if (!reasons.get(id)!.has(w)) reasons.get(id)!.add(w); };

    if (pq.facets.category) {
      const val = accentFold(String(doc.category || ''));
      if (!pq.facets.category.some(v => v === val)) continue; else addWhy('category match');
    }
    if (pq.facets.subcategory) {
      const val = accentFold(String(doc.subcategory || ''));
      if (!pq.facets.subcategory.some(v => v === val)) continue; else addWhy('subcategory match');
    }
    if (pq.facets.intensity) {
      const val = accentFold(String(doc.intensity || ''));
      if (!pq.facets.intensity.some(v => v === val)) continue;
    }
    if (pq.facets.color) {
      const val = accentFold(String(doc.color || ''));
      if (!pq.facets.color.some(v => val.includes(v))) continue;
    }
    if (pq.facets.allergens_not) {
      const all = String(doc.allergens || '').split('|').map(a => accentFold(a));
      if (pq.facets.allergens_not.some(a => all.includes(a))) continue;
    }
    if (pq.facets.serve) {
      for (const s of pq.facets.serve) {
        if ((doc as any)[serveField(s)] === 'TRUE') { addWhy(`serve: ${s}`); }
        else { ok = false; break; }
      }
      if (!ok) continue;
    }
    if (pq.facets.taste) {
      for (const t of pq.facets.taste) {
        const lvl = getScaled(doc, 'taste', t);
        if (lvl > 0) { const boost = Math.min(3, lvl) * 0.1; scores.set(id, (scores.get(id)! + boost)); addWhy(`taste:${t}=${lvl} (+${boost.toFixed(1)})`); }
        else { ok = false; break; }
      }
      if (!ok) continue;
    }
    if (pq.facets.focus) {
      for (const t of pq.facets.focus) {
        const lvl = getScaled(doc, 'focus', t);
        if (lvl > 0) { const boost = Math.min(3, lvl) * 0.1; scores.set(id, (scores.get(id)! + boost)); addWhy(`focus:${t}=${lvl} (+${boost.toFixed(1)})`); }
        else { ok = false; break; }
      }
      if (!ok) continue;
    }

    // ranges
    const caff = doc.caffeine_pct ?? 0;
    if (pq.ranges.caffeine_lt != null && !(caff < pq.ranges.caffeine_lt)) continue;
    if (pq.ranges.caffeine_gt != null && !(caff > pq.ranges.caffeine_gt)) continue;
    const temp = doc.tempC ?? 0;
    if (pq.ranges.tempC_lt != null && !(temp < pq.ranges.tempC_lt)) continue;
    if (pq.ranges.tempC_gt != null && !(temp > pq.ranges.tempC_gt)) continue;
    const steep = doc.steepMin ?? 0;
    if (pq.ranges.steepMin_lt != null && !(steep < pq.ranges.steepMin_lt)) continue;
    if (pq.ranges.steepMin_gt != null && !(steep > pq.ranges.steepMin_gt)) continue;

    // low caffeine boost
    let sc = scores.get(id)!;
    const qlow = qstr.toLowerCase();
    if ((qlow.includes('koffeinmentes') || qlow.includes('low')) && caff <= 20) {
      sc += 0.2; addWhy('caffeine: <=20 (+0.2)');
    }

    const snippet = String((doc.description || '') + ' ' + (doc.mood_short || '')).slice(0, 160);
    results.push({ id, name: String(doc.name), category: doc.category, subcategory: doc.subcategory, caffeine_pct: doc.caffeine_pct, score: sc, snippet, why: Array.from(reasons.get(id) || []) });
  }

  return results.sort((a, b) => b.score - a.score);
}