import { GetStaticProps } from 'next';
import { useState, useEffect, useMemo } from 'react';
import path from 'path';
import { promises as fs } from 'fs';
import TeaGrid, { SortKey } from '../components/TeaGrid';
import Header from '../components/Header';
import TeaModal from '../components/TeaModal';
import CategorySidebar from '../components/CategorySidebar';
import { filterTeas, Tea } from '../utils/filter';
import { toStringArray } from '../lib/toStringArray';

function getSeason(date: Date): string {
  const m = date.getMonth();
  const d = date.getDate();
  if (m < 2 || (m === 2 && d < 21)) return 'tél';
  if (m < 5 || (m === 5 && d < 21)) return 'tavasz';
  if (m < 8 || (m === 8 && d < 23)) return 'nyár';
  if (m < 11 || (m === 11 && d < 21)) return 'ősz';
  return 'tél';
}

function getDaypart(date: Date): string {
  const h = date.getHours();
  if (h >= 5 && h < 10) return 'reggel';
  if (h >= 10 && h < 12) return 'délelőtt';
  if (h >= 12 && h < 18) return 'délután';
  if (h >= 18 && h < 22) return 'este';
  return 'bármikor';
}

function computeRelevance(tea: Tea, now: Date): number {
  let score = 0;
  const season = getSeason(now);
  const daypart = getDaypart(now);
  const seasons = toStringArray(tea.season_recommended);
  const dayparts = toStringArray(tea.daypart_recommended);
  if (seasons.includes(season)) score += 2;
  if (dayparts.includes(daypart)) score += 1;
  return score;
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
    const uniqueCategories = new Set(filtered.map((t) => t.category));
    return uniqueCategories.size === 1
      ? [...filtered].sort((a, b) => a.id - b.id)
      : filtered;
  }, [filtered, sort]);

  const perPage = 9;
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

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
      <Header query={query} onChange={setQuery} />
      <CategorySidebar
        categories={categories}
        selected={selectedCategories}
        onToggle={toggleCategory}
      />
      <TeaGrid teas={paginated} onTeaClick={setSelectedTea} sort={sort} onChangeSort={setSort} />
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