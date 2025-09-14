import { GetStaticProps } from 'next';
import { useState, useEffect, useMemo, useRef } from 'react';
import path from 'path';
import { promises as fs } from 'fs';
import TeaGrid from '../components/TeaGrid';
import Header from '../components/Header';
import { SortKey } from '../components/sortOptions';
import TeaModal from '../components/TeaModal';
import CategorySidebar from '../components/CategorySidebar';
import FilterPanel from '../components/FilterPanel';
import { filterTeas, Tea } from '../utils/filter';
import { toStringArray } from '../lib/toStringArray';
import { distributeByCategory } from '../utils/category-distribution';
import PagerDots from '@/components/PagerDots';

/* ---------- stabil “véletlen” ---------- */
function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}
function deterministicShuffle<T extends { id: number | string }>(arr: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  // Fisher–Yates a MÁSOLATON, de determinisztikus rand-dal
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/* -------------------------------------- */

function normalize(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function getSeason(date: Date): string {
  const m = date.getMonth(); const d = date.getDate();
  if (m < 2 || (m === 2 && d < 21)) return 'tel';
  if (m < 5 || (m === 5 && d < 21)) return 'tavasz';
  if (m < 8 || (m === 8 && d < 22)) return 'nyar';
  if (m < 11 || (m === 11 && d < 21)) return 'osz';
  return 'tel';
}
const SEASON_START: Record<string, number> = { tel: 11, tavasz: 2, nyar: 5, osz: 8 };
function seasonDistance(now: Date, season: string): number {
  const month = now.getMonth(); const start = SEASON_START[season];
  let dist = start - month; if (dist < 0) dist += 12; return dist;
}
function seasonScore(seasons: string[], now: Date): number {
  const normSeasons = seasons.map((s) => normalize(s));
  const current = getSeason(now);
  if (normSeasons.length === 0) return 0;
  if (normSeasons.length === 1 && normSeasons[0] === current) return 30;
  if (normSeasons.includes(current)) {
    let minDist = 12;
    for (const s of normSeasons) { if (s === current) continue;
      const d = seasonDistance(now, s); if (d < minDist) minDist = d; }
    let score = 20 - minDist;
    if (normSeasons.length >= 3) score -= 5;
    return Math.max(0, score);
  }
  let minDist = 12;
  for (const s of normSeasons) { const d = seasonDistance(now, s); if (d < minDist) minDist = d; }
  return Math.max(0, 10 - minDist);
}
function daypartPrefs(now: Date): string[] {
  const h = now.getHours(); const prefs: string[] = [];
  if (h >= 20 || h < 4) prefs.push('lefekves_elott');
  if ((h >= 12 && h <= 13) || (h >= 18 && h <= 21)) prefs.push('etkezes_utan');
  if (h >= 4 && h < 10) prefs.push('reggel');
  if (h >= 10 && h < 12) prefs.push('delelott');
  if (h >= 12 && h < 14) prefs.push('kora_delutan');
  if (h >= 14 && h < 18) prefs.push('delutan');
  if (h >= 18 && h < 22) prefs.push('este');
  prefs.push('barmikor'); return prefs;
}
function daypartScore(dayparts: string[], now: Date): number {
  const norm = dayparts.map((d) => normalize(d).replace(/\s+/g, '_'));
  const prefs = daypartPrefs(now);
  for (let i = 0; i < prefs.length; i++) if (norm.includes(prefs[i])) return prefs.length - i;
  return 0;
}
export function computeRelevance(tea: Tea, now: Date): number {
  const seasons = toStringArray(tea.season_recommended);
  const dayparts = toStringArray(tea.daypart_recommended);
  return seasonScore(seasons, now) * 10 + daypartScore(dayparts, now);
}

interface HomeProps { teas: Tea[]; }

export default function Home({ teas }: HomeProps) {
  const [selectedTea, setSelectedTea] = useState<Tea | null>(null);
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>('relevanceDesc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showCategorySidebar, setShowCategorySidebar] = useState(false);

  // csak kliensen jelöljük, hogy lehet “véletlent” és időt használni
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // shuffleSeed: csak akkor változik, amikor ÚJ választékot kérsz
  const shuffleSeedRef = useRef<number | null>(null);
  const bumpSeed = () => {
    // kliensen biztonságos, SSR-en nem fut
    const base = Math.floor(Math.random() * 2 ** 31);
    // hogy a teas készlet változása is más seedet adjon:
    const poolHash = hash(teas.length + ':' + teas.map(t => t.id).join(','));
    shuffleSeedRef.current = (base ^ poolHash) >>> 0;
  };
  // első mountkor seed generálás
  useEffect(() => { if (mounted && shuffleSeedRef.current === null) bumpSeed(); }, [mounted]);
  // ha keresel vagy kategóriát váltasz → új seed (egyszeri újrakeverés)
  useEffect(() => { if (mounted) bumpSeed(); /* page reset is below */ }, [query, selectedCategories, mounted]);

  // stabil keverés — csak kliensen és csak seedváltáskor
  const shuffledTeas = useMemo(() => {
    if (!mounted || shuffleSeedRef.current === null) return teas; // SSR: determinisztikus
    return deterministicShuffle(teas, shuffleSeedRef.current);
  }, [teas, mounted, shuffleSeedRef.current]);

  // szűrés
  const filtered = useMemo(
    () => filterTeas(shuffledTeas, query).filter(
      (t) => selectedCategories.length === 0 || selectedCategories.includes(t.category),
    ),
    [shuffledTeas, query, selectedCategories],
  );

  // rendezés
  const now = useMemo(() => (mounted ? new Date() : null), [mounted]);
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === 'nameAsc') return arr.sort((a, b) => a.name.localeCompare(b.name, 'hu', { sensitivity: 'base' }));
    if (sort === 'nameDesc') return arr.sort((a, b) => b.name.localeCompare(a.name, 'hu', { sensitivity: 'base' }));
    if (sort === 'intensityAsc' || sort === 'intensityDesc') {
      const map: Record<string, number> = { enyhe: 1, 'közepes': 2, 'erős': 3 };
      arr.sort((a, b) => (map[a.intensity || ''] || 0) - (map[b.intensity || ''] || 0));
      if (sort === 'intensityDesc') arr.reverse();
      return arr;
    }
    if (sort === 'steepMinAsc') return arr.sort((a, b) => (a.steepMin || 0) - (b.steepMin || 0));
    if (sort === 'steepMinDesc') return arr.sort((a, b) => (b.steepMin || 0) - (a.steepMin || 0));
    if (sort === 'relevanceDesc') {
      if (!now) return arr; // SSR: ne függjön az időtől
      return arr.sort((a, b) => computeRelevance(b, now) - computeRelevance(a, now));
    }
    return arr;
  }, [filtered, sort, now]);

  const perPage = 9;

  const distributed = useMemo(
  () => distributeByCategory(sorted, perPage, 3, shuffleSeedRef.current ?? 0),
  [sorted, perPage, shuffleSeedRef.current]
);

  const paginated = useMemo(() => {
    const slice = distributed.slice((page - 1) * perPage, page * perPage);
    if (new Set(slice.map((t) => t.category)).size === 1) {
      return [...slice].sort((a, b) => a.id - b.id);
    }
    return slice;
  }, [distributed, page]);

  const categories = useMemo(
    () => Array.from(new Set(teas.map((t) => t.category)))
      .sort((a, b) => a.localeCompare(b, 'hu', { sensitivity: 'base' })),
    [teas],
  );

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  };

  useEffect(() => { setPage(1); }, [query, selectedCategories]);

  return (
    <>
      <Header
        query={query}
        onChange={setQuery}
        onOpenFilters={() => setFiltersOpen(true)}
        sort={sort}
        onChangeSort={setSort}
      />
      {showCategorySidebar && (
        <CategorySidebar categories={categories} selected={selectedCategories} onToggle={toggleCategory} />
      )}
      <FilterPanel
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onSelect={(key) => { if (key === 'category') setShowCategorySidebar(true); setFiltersOpen(false); }}
      />
      <TeaGrid teas={paginated} onTeaClick={setSelectedTea} />
      <div className="pagerBar">
        {page > 1 && (
          <button
            className="pager-prev"
            aria-label="Előző oldal"
            onClick={() => setPage(page - 1)}
          >
            Előző
          </button>
        )}

        <PagerDots
          page={page - 1}
          totalPages={Math.ceil(filtered.length / perPage)}
          onGoTo={(i) => setPage(i + 1)}
        />

        {page * perPage < filtered.length && (
          <button
            className="pager-next"
            aria-label="Következő oldal"
            onClick={() => setPage(page + 1)}
          >
            Következő
          </button>
        )}
      </div>
      {selectedTea && <TeaModal tea={selectedTea} onClose={() => setSelectedTea(null)} />}
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const filePath = path.join(process.cwd(), 'data', 'teas.json');
  const jsonData = await fs.readFile(filePath, 'utf8');
  const rawTeas: any[] = JSON.parse(jsonData);
  const descPath = path.join(process.cwd(), 'data', 'teas_descriptions.json');
  const descData = await fs.readFile(descPath, 'utf8');
  const descList: any[] = JSON.parse(descData);
  const descMap: Record<number, any> = {};
  for (const d of descList) descMap[d.id] = d;

  const teas: Tea[] = rawTeas.map((t) => {
    const d = descMap[t.id] || {};
    return {
      ...t,
      season_recommended: toStringArray(t.season_recommended),
      daypart_recommended: toStringArray(t.daypart_recommended),
      fullDescription: d['főszöveg'],
      when: d['mikor'],
      origin: d['eredet'],
    };
  });

  const catMap: Record<string, Tea[]> = {};
  for (const tea of teas) (catMap[tea.category] ||= []).push(tea);

  const sorted: Tea[] = [];
  let idx = 0;
  for (const cat of Object.keys(catMap)) {
    const group = catMap[cat].sort((a, b) => a.id - b.id);
    for (const t of group) { t.mandalaIndex = idx++; sorted.push(t); }
  }

  return { props: { teas: sorted } };
};
