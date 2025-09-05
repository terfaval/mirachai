import styles from '../styles/SearchBar.module.css';

interface Props {
  query: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ query, onChange }: Props) {
  return (
    <input
      className={styles.search}
      type="text"
      placeholder="Keresés..."
      value={query}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}