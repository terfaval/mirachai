import { useEffect, useRef, useState } from 'react';
import SearchBar from './SearchBar';
import styles from '../styles/Header.module.css';
import { SortKey, sortOptions } from './sortOptions';

interface Props {
  query: string;
  onChange: (value: string) => void;
  onOpenFilters: () => void;
  sort: SortKey;
  onChangeSort: (key: SortKey) => void;
}

export default function Header({ query, onChange, onOpenFilters, sort, onChangeSort }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const searchIconRef = useRef<HTMLImageElement>(null);
  const sortContainerRef = useRef<HTMLDivElement>(null);

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
      if (
        sortOpen &&
        !sortContainerRef.current?.contains(e.target as Node)
      ) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen, sortOpen]);

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
        <div ref={sortContainerRef} className={styles.sortContainer}>
          <img
            src="/sort.svg"
            alt="Rendezés"
            className={styles.icon}
            onClick={() => setSortOpen((v) => !v)}
          />
          {(sortOpen || sort !== 'relevanceDesc') && (
            <table className={styles.sortPanel}>
              <tbody>
                {sortOptions
                  .filter((opt) => sortOpen || opt.key === sort)
                  .map((opt) => (
                    <tr key={opt.key}>
                      <td>
                        <button
                          onClick={() => {
                            onChangeSort(opt.key);
                            setSortOpen(false);
                          }}
                          className={sort === opt.key ? styles.active : ''}
                        >
                          {opt.label}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
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