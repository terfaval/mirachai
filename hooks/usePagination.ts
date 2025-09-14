import { useEffect, useState } from 'react';

export function usePagination(total: number, pageSize: number, initial = 1) {
  const [page, setPage] = useState(initial);
  const totalPages = Math.max(1, Math.ceil(Math.max(0, total) / Math.max(1, pageSize)));
  const clamp = (p: number) => Math.min(Math.max(1, p), totalPages);

  // if total changes and current page is out of range, clamp it
  useEffect(() => { setPage(p => clamp(p)); }, [totalPages]);

  return {
    page,
    pageSize,
    total,
    totalPages,
    setPage: (p: number) => setPage(clamp(p)),
    next: () => setPage(p => clamp(p + 1)),
    prev: () => setPage(p => clamp(p - 1)),
    slice<T>(arr: T[]): T[] {
      const start = (page - 1) * pageSize;
      return arr.slice(start, start + pageSize);
    }
  };
}