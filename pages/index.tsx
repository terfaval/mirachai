import { GetStaticProps } from 'next';
import { useState } from 'react';
import path from 'path';
import { promises as fs } from 'fs';
import TeaGrid from '../components/TeaGrid';
import Header from '../components/Header';
import { filterTeas, Tea } from '../utils/filter';

interface HomeProps {
  teas: Tea[];
}

export default function Home({ teas }: HomeProps) {
  const [query, setQuery] = useState('');
  const filtered = filterTeas(teas, query).slice(0, 9);

  return (
    <>
      <Header query={query} onChange={setQuery} />
      <TeaGrid teas={filtered} />
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
  for (const cat of Object.keys(catMap)) {
    const group = catMap[cat].sort((a, b) => a.id - b.id);
    group.forEach((t, idx) => {
      t.mandalaIndex = idx;
      sorted.push(t);
    });
  }

  return { props: { teas: sorted } };
};