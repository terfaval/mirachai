import SearchBar from './SearchBar';
import styles from '../styles/Header.module.css';

interface Props {
  query: string;
  onChange: (value: string) => void;
}

export default function Header({ query, onChange }: Props) {
  return (
    <header className={styles.header}>
      <img src="/mirachai_logo.svg" alt="Mirachai logo" className={styles.logo} />
      <div className={styles.actions}>
        <SearchBar query={query} onChange={onChange} />
      </div>
    </header>
  );
}