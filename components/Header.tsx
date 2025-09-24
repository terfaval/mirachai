import styles from '../styles/Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <img src="/mirachai_logo.svg" alt="Mirachai logo" className={styles.logo} />
    </header>
  );
}