type Props = {
  current: number; // 1-index
  total: number; // >= 1
  onSelect: (p: number) => void;
};
export default function PagerDots({ current, total, onSelect }: Props) {
  if (!total || total <= 1) return null;
  return (
    <div className="pager-dots" role="tablist" aria-label="Oldalak">
      {Array.from({ length: total }).map((_, i) => {
        const page = i + 1;
        return (
          <button
            key={`dot-${page}`}
            type="button"
            className={`pager-dot ${page === current ? 'is-active' : ''}`}
            aria-label={`${page}. oldal`}
            aria-current={page === current ? 'page' : undefined}
            onClick={() => onSelect(page)}
          />
        );
      })}
    </div>
  );
}