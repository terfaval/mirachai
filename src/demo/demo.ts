import { readFileSync } from 'fs';
import { buildIndex, search } from '../search/engine';
import { Tea } from '../search/types';
import { toStringArray } from '../../lib/toStringArray';

const rawTeas: any[] = JSON.parse(readFileSync('data/teas.json', 'utf8'));
const teas: Tea[] = rawTeas.map((t) => ({
  ...t,
  season_recommended: toStringArray(t.season_recommended),
  daypart_recommended: toStringArray(t.daypart_recommended),
}));
const idx = buildIndex(teas);

const queries = [
  'jeges friss chai',
  'caffeine:<20 taste:friss serve:iced',
  'category:"Kínai Klasszikus" taste:virágos',
  '"zöld tea" -menta',
  'allergens:!citrus "rózsa"'
];

for (const q of queries) {
  const res = search(idx, q).slice(0, 5);
  console.log(`\nQuery: ${q}`);
  for (const r of res) {
    console.log(r.score.toFixed(2), r.name, r.why);
  }
}