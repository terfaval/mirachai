import styles from '../styles/Header.module.css';

export default function Header() {
  return (
    <header
      className={`${styles.header} px-4 py-3 sm:pl-20 sm:pr-10 sm:py-[10px]`}
    >
      <img
        src="/mirachai_logo.svg"
        alt="Mirachai logo"
        className={`${styles.logo} h-8 w-auto sm:h-[120px]`}
      />
    </header>
  );
}
