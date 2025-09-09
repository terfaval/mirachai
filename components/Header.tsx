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
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const searchIconRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchOpen &&
        !searchWrapperRef.current?.contains(e.target as Node) &&
        !searchIconRef.current?.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  return (
    <header className={styles.header}>
      <img src="/mirachai_logo.svg" alt="Mirachai logo" className={styles.logo} />
      <div className={styles.actions}>
        <img
          ref={searchIconRef}
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
      <div
        ref={searchWrapperRef}
        className={`${styles.searchWrapper} ${searchOpen ? styles.open : ''}`}
      >
        <SearchBar ref={inputRef} query={query} onChange={onChange} />
      </div>
    </header>
  );
}