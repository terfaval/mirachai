import { useEffect } from 'react';
import PagerDots from './PagerDots';
import styles from '../styles/PaginationBar.module.css';

type PaginationBarVariant = 'fluid' | 'sticky';

type Props = {
  page: number;
  totalPages: number;
  onSelect: (p: number) => void;
  'aria-controls'?: string;
  variant?: PaginationBarVariant;
};

export default function PaginationBar({
  page,
  totalPages,
  onSelect,
  variant = 'sticky',
  ...a11y
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onSelect(Math.max(1, page - 1));
      if (e.key === 'ArrowRight') onSelect(Math.min(totalPages, page + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [page, totalPages, onSelect]);

  if (totalPages <= 1) return null;

  const className = [styles.pagerBar, variant === 'fluid' ? styles.fluid : '']
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={className} aria-label="Pagination" {...a11y}>
      <button
        type="button"
        className={styles.navBtn}
        aria-label="Previous page"
        onClick={() => onSelect(Math.max(1, page - 1))}
        disabled={page <= 1}
      />
      <PagerDots current={page} total={totalPages} onSelect={onSelect} />
      <button
        type="button"
        className={styles.navBtn}
        aria-label="Next page"
        onClick={() => onSelect(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      />
    </nav>
  );
}