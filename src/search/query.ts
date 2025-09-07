import { accentFold, tokenize } from './normalize';
import { mapSyn } from './synonyms';
import { ParsedQuery } from './types';


const BOOL_TOKENS: Record<string, { facet: keyof ParsedQuery['facets']; value: string }> = {
  jeges: { facet: 'serve', value: 'jeges' },
  forron: { facet: 'serve', value: 'forron' },
  langyosan: { facet: 'serve', value: 'langyosan' },
  coldbrew: { facet: 'serve', value: 'coldbrew' },
};


const parseParts = (q: string): string[] => {
  const parts: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < q.length; i++) {
    const ch = q[i];
    if (ch === '"') { inQuote = !inQuote; continue; }
    if (ch === ' ' && !inQuote) { if (cur) { parts.push(cur); cur = ''; } continue; }
    cur += ch;
  }
  if (cur) parts.push(cur);
  return parts;
};

/** Parse human query string into structured query */
export function parseQuery(qstr: string): ParsedQuery {
  const parts = parseParts(qstr);
  const pq: ParsedQuery = {
    tokens: [],
    must: [],
    not: [],
    facets: {},
    ranges: {},
    rawTokens: [],
  };

  for (let part of parts) {
    let neg = false;
    let must = false;
    if (part.startsWith('-')) { neg = true; part = part.slice(1); }
    else if (part.startsWith('+')) { must = true; part = part.slice(1); }

    const fieldMatch = part.match(/^([^:]+):(.*)$/);
    if (fieldMatch) {
      const field = accentFold(fieldMatch[1]).toLowerCase();
      let value = fieldMatch[2];
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      const normVal = mapSyn(accentFold(value.toLowerCase()));
      if (['category','subcategory','taste','focus','serve','allergens','intensity','color'].includes(field)) {
        if (field === 'allergens' && normVal.startsWith('!')) {
          pq.facets.allergens_not = pq.facets.allergens_not || [];
          pq.facets.allergens_not.push(normVal.slice(1));
        } else {
          const key = field as keyof typeof pq.facets;
          (pq.facets[key] = pq.facets[key] || []).push(normVal);
        }
      } else if (['caffeine','tempc','steepmin'].includes(field)) {
        const m = normVal.match(/^(<=|>=|<|>)(\d+(?:\.\d+)?)$/);
        if (m) {
          const num = parseFloat(m[2]);
          const cmp = m[1];
          const keyBase = field === 'caffeine' ? 'caffeine' : field;
          (pq.ranges as any)[`${keyBase}_${cmp.replace('<=','lt').replace('>=','gt').replace('<','lt').replace('>','gt')}`] = num;
        }
      }
      continue;
    }

    // free token
    const toks = tokenize(part);
    for (const rawTok of toks) {
      const tok = mapSyn(rawTok);
      const bool = BOOL_TOKENS[tok];
      if (bool && !neg && !must) {
        const key = bool.facet as keyof typeof pq.facets;
        (pq.facets[key] = pq.facets[key] || []).push(bool.value);
      } else {
        if (neg) pq.not.push(tok); else if (must) pq.must.push(tok); else pq.tokens.push(tok);
      }
      pq.rawTokens!.push(rawTok);
    }
  }

  return pq;
}