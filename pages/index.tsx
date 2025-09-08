import { GetStaticProps } from 'next';
import { useState, useEffect } from 'react';
import path from 'path';
import { promises as fs } from 'fs';
import TeaGrid from '../components/TeaGrid';
import Header from '../components/Header';
import TeaModal from '../components/TeaModal';
import FilterPanel from '../components/FilterPanel';
import { filterTeas, Tea } from '../utils/filter';

interface HomeProps {
  teas: Tea[];
}

export default function Home({ teas }: HomeProps) {
  const [selectedTea, setSelectedTea] = useState<Tea | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = filterTeas(teas, query).filter(t => !category || t.category === category);
  const perPage = 9;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const categories = Array.from(new Set(teas.map(t => t.category))).sort();

  const closeFilter = () => setFilterOpen(false);

  useEffect(() => {
    setPage(1);
  }, [query, category]);

  return (
    <>
      <Header query={query} onChange={setQuery} onFilterClick={() => setFilterOpen(true)} />
      <TeaGrid teas={paginated} onTeaClick={setSelectedTea} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
        {page > 1 && <button onClick={() => setPage(page - 1)}>Előző</button>}
        {page * perPage < filtered.length && <button onClick={() => setPage(page + 1)}>Következő</button>}
      </div>
      {selectedTea && (
        <TeaModal tea={selectedTea} onClose={() => setSelectedTea(null)} />
      )}
      <FilterPanel
        open={filterOpen}
        categories={categories}
        selectedCategory={category}
        onSelectCategory={setCategory}
        onClose={closeFilter}
      />
    </>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const filePath = path.join(process.cwd(), 'data', 'teas.json');
  const jsonData = await fs.readFile(filePath, 'utf8');
  const teas: Tea[] = JSON.parse(jsonData);
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