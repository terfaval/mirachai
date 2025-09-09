import { forwardRef } from 'react';
import styles from '../styles/SearchBar.module.css';

interface Props {
  query: string;
  onChange: (value: string) => void;
}

const SearchBar = forwardRef<HTMLInputElement, Props>(function SearchBar(
  { query, onChange },
  ref,
) {
  return (
    <input
      ref={ref}
      className={styles.search}
      type="text"
      placeholder="Keresés..."
      value={query}
      onChange={(e) => onChange(e.target.value)}
    />
  );
});

export default SearchBar;