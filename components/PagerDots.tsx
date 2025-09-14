type Props = {
  page: number;            // 0-index
  totalPages: number;      // >= 1
  onGoTo: (page: number) => void;
};
export default function PagerDots({ page, totalPages, onGoTo }: Props) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className="pager-dots" role="tablist" aria-label="Oldalak">
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={`dot-${i}`}
          type="button"
          className={`pager-dot ${i === page ? 'is-active' : ''}`}
          aria-label={`${i + 1}. oldal`}
          aria-current={i === page ? 'page' : undefined}
          onClick={() => onGoTo(i)}
        />
      ))}
    </div>
  );
}