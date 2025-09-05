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
  return { props: { teas } };
};