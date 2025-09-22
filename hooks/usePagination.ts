import { useCallback, useEffect, useState } from 'react';

export function usePagination(totalItems: number, perPage = 9, initialPage = 1) {
  const [page, setPage] = useState(initialPage);
  const totalPages = Math.max(1, Math.ceil(Math.max(0, totalItems) / Math.max(1, perPage)));

  // keep page within range if total changes
  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const start = (page - 1) * perPage;
  const end = start + perPage;

  const goTo = useCallback(
    (p: number) => {
      setPage(Math.min(Math.max(1, p), totalPages));
    },
    [totalPages],
  );

  const next = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prev = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  return { page, totalPages, perPage, start, end, next, prev, goTo };
}
