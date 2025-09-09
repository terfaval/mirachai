import { GetStaticProps } from 'next';
import { useState, useEffect, useMemo } from 'react';
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

function normalize(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getSeason(date: Date): string {
  const m = date.getMonth();
  const d = date.getDate();
  if (m < 2 || (m === 2 && d < 21)) return 'tel';
  if (m < 5 || (m === 5 && d < 21)) return 'tavasz';
  if (m < 8 || (m === 8 && d < 22)) return 'nyar';
  if (m < 11 || (m === 11 && d < 21)) return 'osz';
  return 'tel';
}

const SEASON_START: Record<string, number> = {
  tel: 11,
  tavasz: 2,
  nyar: 5,
  osz: 8,
};

function seasonDistance(now: Date, season: string): number {
  const month = now.getMonth();
  const start = SEASON_START[season];
  let dist = start - month;
  if (dist < 0) dist += 12;
  return dist;
}

function seasonScore(seasons: string[], now: Date): number {
  const normSeasons = seasons.map((s) => normalize(s));
  const current = getSeason(now);
  if (normSeasons.length === 0) return 0;
  if (normSeasons.length === 1 && normSeasons[0] === current) return 30;
  if (normSeasons.includes(current)) {
    let minDist = 12;
    for (const s of normSeasons) {
      if (s === current) continue;
      const d = seasonDistance(now, s);
      if (d < minDist) minDist = d;
    }
    return Math.max(0, 20 - minDist);
  }
  let minDist = 12;
  for (const s of normSeasons) {
    const d = seasonDistance(now, s);
    if (d < minDist) minDist = d;
  }
  return Math.max(0, 10 - minDist);
}

function daypartPrefs(now: Date): string[] {
  const h = now.getHours();
  const prefs: string[] = [];
  if (h >= 20 || h < 4) prefs.push('lefekves_elott');
  if ((h >= 12 && h <= 13) || (h >= 18 && h <= 21)) prefs.push('etkezes_utan');
  if (h >= 4 && h < 10) prefs.push('reggel');
  if (h >= 10 && h < 12) prefs.push('delelott');
  if (h >= 12 && h < 14) prefs.push('kora_delutan');
  if (h >= 14 && h < 18) prefs.push('delutan');
  if (h >= 18 && h < 22) prefs.push('este');
  prefs.push('barmikor');
  return prefs;
}

function daypartScore(dayparts: string[], now: Date): number {
  const norm = dayparts.map((d) => normalize(d).replace(/\s+/g, '_'));
  const prefs = daypartPrefs(now);
  for (let i = 0; i < prefs.length; i++) {
    if (norm.includes(prefs[i])) {
      return prefs.length - i;
    }
  }
  return 0;
}

export function computeRelevance(tea: Tea, now: Date): number {
  const seasons = toStringArray(tea.season_recommended);
  const dayparts = toStringArray(tea.daypart_recommended);
  const sScore = seasonScore(seasons, now);
  const dScore = daypartScore(dayparts, now);
  return sScore * 10 + dScore;
}

interface HomeProps {
  teas: Tea[];
}

export default function Home({ teas }: HomeProps) {
  const [selectedTea, setSelectedTea] = useState<Tea | null>(null);
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>('relevanceDesc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showCategorySidebar, setShowCategorySidebar] = useState(false);

  const [shuffledTeas, setShuffledTeas] = useState<Tea[]>(teas);

  useEffect(() => {
    setShuffledTeas((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  }, []);

  const filtered = filterTeas(shuffledTeas, query).filter(
    (t) => selectedCategories.length === 0 || selectedCategories.includes(t.category),
  );

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === 'nameAsc') {
      arr.sort((a, b) => a.name.localeCompare(b.name, 'hu', { sensitivity: 'base' }));
      return arr;
    }
    if (sort === 'nameDesc') {
      arr.sort((a, b) => b.name.localeCompare(a.name, 'hu', { sensitivity: 'base' }));
      return arr;
    }
    if (sort === 'intensityAsc' || sort === 'intensityDesc') {
      const map: Record<string, number> = { enyhe: 1, 'közepes': 2, 'erős': 3 };
      arr.sort((a, b) => (map[a.intensity || ''] || 0) - (map[b.intensity || ''] || 0));
      if (sort === 'intensityDesc') arr.reverse();
      return arr;
    }
    if (sort === 'steepMinAsc') {
      arr.sort((a, b) => (a.steepMin || 0) - (b.steepMin || 0));
      return arr;
    }
    if (sort === 'steepMinDesc') {
      arr.sort((a, b) => (b.steepMin || 0) - (a.steepMin || 0));
      return arr;
    }
    if (sort === 'relevanceDesc') {
      const now = new Date();
      arr.sort((a, b) => computeRelevance(b, now) - computeRelevance(a, now));
      return arr;
    }
    return filtered;
  }, [filtered, sort]);

  const perPage = 9;
  const distributed = useMemo(
    () => distributeByCategory(sorted, perPage, 3),
    [sorted, perPage],
  );
  const paginated = useMemo(() => {
    const slice = distributed.slice((page - 1) * perPage, page * perPage);
    if (new Set(slice.map((t) => t.category)).size === 1) {
      return [...slice].sort((a, b) => a.id - b.id);
    }
    return slice;
  }, [distributed, page]);

  const categories = Array.from(new Set(teas.map((t) => t.category))).sort();

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  useEffect(() => {
    setPage(1);
  }, [query, selectedCategories]);

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
        <CategorySidebar
          categories={categories}
          selected={selectedCategories}
          onToggle={toggleCategory}
        />
      )}
      <FilterPanel
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onSelect={(key) => {
          if (key === 'category') setShowCategorySidebar(true);
          setFiltersOpen(false);
        }}
      />
      <TeaGrid teas={paginated} onTeaClick={setSelectedTea} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
        {page > 1 && <button onClick={() => setPage(page - 1)}>Előző</button>}
        {page * perPage < filtered.length && <button onClick={() => setPage(page + 1)}>Következő</button>}
      </div>
      {selectedTea && (
        <TeaModal tea={selectedTea} onClose={() => setSelectedTea(null)} />
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const filePath = path.join(process.cwd(), 'data', 'teas.json');
  const jsonData = await fs.readFile(filePath, 'utf8');
  const rawTeas: any[] = JSON.parse(jsonData);
  const teas: Tea[] = rawTeas.map((t) => ({
    ...t,
    season_recommended: toStringArray(t.season_recommended),
    daypart_recommended: toStringArray(t.daypart_recommended),
  }));
  const catMap: Record<string, Tea[]> = {};
  for (const tea of teas) {
    (catMap[tea.category] ||= []).push(tea);
  }

  const sorted: Tea[] = [];
  let idx = 0;
  for (const cat of Object.keys(catMap)) {
    const group = catMap[cat].sort((a, b) => a.id - b.id);
    for (const t of group) {
      t.mandalaIndex = idx++;
      sorted.push(t);
    }
  }

  return { props: { teas: sorted } };
};