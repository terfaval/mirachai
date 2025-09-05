import styles from '../styles/Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <img src="/mirachai_logo.svg" alt="Mirachai logo" className={styles.logo} />
      <div className={styles.actions}>
        <div className={styles.iconContainer}>
          <img src="/filter.svg" className={`filter-button ${styles.icon}`} alt="Szűrés" />
          <span className={styles.tooltip}>Szűrés</span>
        </div>
        <div className={styles.iconContainer}>
          <img src="/search.svg" className={`search-button ${styles.icon}`} alt="Keresés" />
          <span className={styles.tooltip}>Keresés</span>
        </div>
      </div>
    </header>
  );
}