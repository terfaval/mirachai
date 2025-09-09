import { useEffect, useRef, useState } from 'react';
import SearchBar from './SearchBar';
import styles from '../styles/Header.module.css';

interface Props {
  query: string;
  onChange: (value: string) => void;
  onOpenFilters: () => void;
}

export default function Header({ query, onChange, onOpenFilters }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    }
  }, [searchOpen]);

  return (
    <header className={styles.header}>
      <img src="/mirachai_logo.svg" alt="Mirachai logo" className={styles.logo} />
      <div className={styles.actions}>
        <img
          src="/search.svg"
          alt="Keresés"
          className={styles.icon}
          onClick={() => setSearchOpen((v) => !v)}
        />
        <img
          src="/filter.svg"
          alt="Szűrés"
          className={styles.icon}
          onClick={onOpenFilters}
        />
      </div>
      <div className={`${styles.searchWrapper} ${searchOpen ? styles.open : ''}`}>
        <SearchBar ref={inputRef} query={query} onChange={onChange} />
      </div>
    </header>
  );
}