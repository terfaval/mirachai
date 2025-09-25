export type PaginateOptions = {
  page: number;
  size: number;
};

export type PaginationResult<T> = {
  items: T[];
  pageCount: number;
};

export function paginate<T>(items: readonly T[], options: PaginateOptions): PaginationResult<T> {
  const size = Math.max(1, options.size);
  const pageCount = Math.max(1, Math.ceil(items.length / size));
  const page = Math.min(Math.max(1, options.page), pageCount);
  const start = (page - 1) * size;
  const end = start + size;
  return {
    items: items.slice(start, end),
    pageCount,
  };
}