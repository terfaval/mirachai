import SearchBar from './SearchBar';
import styles from '../styles/Header.module.css';

interface Props {
  query: string;
  onChange: (value: string) => void;
  onFilterClick: () => void;
}

export default function Header({ query, onChange, onFilterClick }: Props) {
  return (
    <header className={styles.header}>
      <img src="/mirachai_logo.svg" alt="Mirachai logo" className={styles.logo} />
      <div className={styles.actions}>
        <SearchBar query={query} onChange={onChange} />
        <div className={styles.iconContainer}>
          <img
            src="/filter.svg"
            className={`filter-button ${styles.icon}`}
            alt="Szűrés"
            onClick={onFilterClick}
          />
          <span className={styles.tooltip}>Szűrés</span>
        </div>
      </div>
    </header>
  );
}