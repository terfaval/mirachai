import React from 'react';
import PagerDots from './PagerDots';

type Props = {
  page: number;
  totalPages: number;
  onSelect: (p: number) => void;
  'aria-controls'?: string;
};

export default function PaginationBar({ page, totalPages, onSelect, ...a11y }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pager-bar" aria-label="Pagination" {...a11y}>
      <button
        type="button"
        onClick={() => onSelect(Math.max(1, page - 1))}
        aria-label="Previous page"
        disabled={page <= 1}
      >
        ‹
      </button>
      <PagerDots current={page} total={totalPages} onSelect={onSelect} />
      <button
        type="button"
        onClick={() => onSelect(Math.min(totalPages, page + 1))}
        aria-label="Next page"
        disabled={page >= totalPages}
      >
        ›
      </button>
    </nav>
  );
}