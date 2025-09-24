import { useEffect, useRef, useState } from 'react';
import SearchBar from './SearchBar';
import { SortKey, sortOptions } from './sortOptions';
import styles from '../styles/BrowseToolsSidebar.module.css';

type Props = {
  query: string;
  onChangeQuery: (value: string) => void;
  sort: SortKey;
  onChangeSort: (value: SortKey) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  onEnterFullscreen: () => void;
  isFullscreen: boolean;
};

export default function BrowseToolsSidebar({
  query,
  onChangeQuery,
  sort,
  onChangeSort,
  onOpenFilters,
  activeFilterCount,
  onEnterFullscreen,
  isFullscreen,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortActive = sort !== 'relevanceDesc';
  const filtersActive = activeFilterCount > 0;

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
        setSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.stack}>
        <div className={styles.item}>
          <button
            type="button"
            className={`${styles.button} ${searchOpen ? styles.active : ''}`}
            onClick={() => setSearchOpen((prev) => !prev)}
            aria-expanded={searchOpen}
            aria-controls="browse-search-panel"
          >
            <img src="/icons/search.svg" alt="Keresés" className={styles.icon} />
            <div className={styles.textWrap}>
              <span className={styles.label}>Keresés</span>
              {query && searchOpen && (
                <span className={styles.value}>
                  „{query}”
                </span>
              )}
            </div>
          </button>
          {searchOpen && (
            <div id="browse-search-panel" className={styles.searchPanel}>
              <SearchBar ref={searchInputRef} query={query} onChange={onChangeQuery} />
            </div>
          )}
        </div>

        <div className={styles.item}>
          <button
            type="button"
            className={`${styles.button} ${sortActive ? styles.hasValue : ''}`}
            onClick={() => setSortOpen((prev) => !prev)}
            aria-expanded={sortOpen}
            aria-controls="browse-sort-panel"
          >
            <img src="/icons/sort.svg" alt="Rendezés" className={styles.icon} />
            <div className={styles.textWrap}>
              <span className={styles.label}>Rendezés</span>
              </div>
          </button>
          {sortOpen && (
            <div id="browse-sort-panel" className={styles.sortPanel}>
              <table>
                <tbody>
                  {sortOptions.map((opt) => (
                    <tr key={opt.key}>
                      <td>
                        <button
                          type="button"
                          className={sort === opt.key ? styles.selected : ''}
                          onClick={() => {
                            onChangeSort(opt.key);
                            setSortOpen(false);
                          }}
                        >
                          {opt.label}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={styles.item}>
          <button
            type="button"
            className={`${styles.button} ${filtersActive ? styles.hasValue : ''}`}
            onClick={onOpenFilters}
          >
            <img src="/icons/filter.svg" alt="Szűrés" className={styles.icon} />
            <div className={styles.textWrap}>
              <span className={styles.label}>Szűrők</span>
              </div>
          </button>
        </div>
      {!isFullscreen && (
          <div className={styles.item}>
            <button
              type="button"
              className={styles.button}
              onClick={onEnterFullscreen}
            >
              <img src="/icons/fullscreen.svg" alt="Teljes képernyő" className={styles.icon} />
              <div className={styles.textWrap}>
                <span className={styles.label}>Teljes képernyő</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}