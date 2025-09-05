import { useState } from 'react';
import TeaGrid from '../components/TeaGrid';
import SearchBar from '../components/SearchBar';
import teasData from '../data/teas.json';
import { filterTeas, Tea } from '../utils/filter';

export default function Home() {
  const [query, setQuery] = useState('');
  const teas = filterTeas(teasData as Tea[], query).slice(0, 12);

  return (
    <>
      <SearchBar query={query} onChange={setQuery} />
      <TeaGrid teas={teas} />
    </>
  );
}